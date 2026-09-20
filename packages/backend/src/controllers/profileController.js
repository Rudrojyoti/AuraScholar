const { supabase, isConfigured: isSupabaseConfigured } = require('../services/supabaseClient');

// In-memory fallback map for profiles
const inMemoryProfiles = new Map();

const getProfile = async (req, res) => {
  try {
    const userId = req.auth?.userId || req.query.userId;
    if (!userId) {
      return res.status(400).json({ status: 'error', message: 'Missing userId parameter' });
    }

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        return res.status(200).json({
          status: 'success',
          data: {
            userId: data.user_id,
            displayName: data.display_name,
            email: data.email,
            affiliation: data.affiliation,
            avatarUrl: data.avatar_url,
            researchFields: data.research_fields || [],
            leadModel: data.lead_model,
            citationFormat: data.citation_format,
            autoRenderLatex: data.auto_render_latex,
            dailyDigest: data.daily_digest,
            updatedAt: data.updated_at
          }
        });
      }
    }

    // In-memory fallback
    const local = inMemoryProfiles.get(userId);
    if (local) {
      return res.status(200).json({ status: 'success', data: local });
    }

    return res.status(404).json({ status: 'error', message: 'Profile not found' });
  } catch (error) {
    console.error('getProfile error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

const upsertProfile = async (req, res) => {
  try {
    const userId = req.auth?.userId || req.body.userId;
    if (!userId) {
      return res.status(400).json({ status: 'error', message: 'Missing userId in request body' });
    }

    const {
      displayName,
      email,
      affiliation,
      avatarUrl,
      researchFields,
      leadModel,
      citationFormat,
      autoRenderLatex,
      dailyDigest
    } = req.body;

    const profileRecord = {
      user_id: userId,
      display_name: displayName,
      email: email,
      affiliation: affiliation,
      avatar_url: avatarUrl || null,
      research_fields: Array.isArray(researchFields) ? researchFields : [],
      lead_model: leadModel || 'qwen-2.5-qwq',
      citation_format: citationFormat || 'bibtex',
      auto_render_latex: autoRenderLatex !== undefined ? autoRenderLatex : true,
      daily_digest: dailyDigest !== undefined ? dailyDigest : true,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileRecord, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        console.warn('⚠️ Supabase upsertProfile error, caching in memory:', error.message);
      } else if (data) {
        return res.status(200).json({
          status: 'success',
          data: {
            userId: data.user_id,
            displayName: data.display_name,
            email: data.email,
            affiliation: data.affiliation,
            avatarUrl: data.avatar_url,
            researchFields: data.research_fields,
            leadModel: data.lead_model,
            citationFormat: data.citation_format,
            autoRenderLatex: data.auto_render_latex,
            dailyDigest: data.daily_digest,
            updatedAt: data.updated_at
          }
        });
      }
    }

    // Fallback save in memory
    const formatted = {
      userId,
      displayName,
      email,
      affiliation,
      avatarUrl: avatarUrl || null,
      researchFields: researchFields || [],
      leadModel,
      citationFormat,
      autoRenderLatex,
      dailyDigest,
      updatedAt: new Date().toISOString()
    };
    inMemoryProfiles.set(userId, formatted);

    return res.status(200).json({
      status: 'success',
      data: formatted
    });
  } catch (error) {
    console.error('upsertProfile error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = {
  getProfile,
  upsertProfile
};
