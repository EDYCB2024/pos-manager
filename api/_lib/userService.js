import { supabase } from './supabase.js';
import { hashPassword } from './hash.js';
import { sendActivationEmail } from './mailer.js';
import crypto from 'crypto';

export async function inviteUser({ name, email, role }) {
    // 1. Create user in Supabase (inactive)
    const { data: user, error: userError } = await supabase
        .from('users')
        .insert([{ name, email, role, active: false }])
        .select()
        .single();

    if (userError) throw new Error(userError.message);

    // 2. Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // 3. Save token
    const { error: tokenError } = await supabase
        .from('activation_tokens')
        .insert([{
            user_id: user.id,
            token,
            expires_at: expiresAt.toISOString()
        }]);

    if (tokenError) {
        // Cleanup user if token fails
        await supabase.from('users').delete().eq('id', user.id);
        throw new Error(tokenError.message);
    }

    // 4. Send email
    await sendActivationEmail(email, name, token);

    return user;
}

export async function activateUser(token, password) {
    // 1. Find token
    const { data: tokenData, error: tokenError } = await supabase
        .from('activation_tokens')
        .select('*, users(*)')
        .eq('token', token)
        .eq('used', false)
        .single();

    if (tokenError || !tokenData) {
        throw new Error('Token inválido o ya utilizado');
    }

    // 2. Check expiry
    if (new Date(tokenData.expires_at) < new Date()) {
        throw new Error('El token ha expirado');
    }

    // 3. Hash password
    const password_hash = await hashPassword(password);

    // 4. Update user
    const { error: userUpdateError } = await supabase
        .from('users')
        .update({ password_hash, active: true })
        .eq('id', tokenData.user_id);

    if (userUpdateError) throw new Error(userUpdateError.message);

    // 5. Mark token as used
    await supabase
        .from('activation_tokens')
        .update({ used: true })
        .eq('id', tokenData.id);

    return { success: true };
}

export async function getUsers() {
    const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, active, created_at')
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
}
