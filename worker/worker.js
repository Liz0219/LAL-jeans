export default {
  async fetch(request, env, ctx) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('OK', { status: 200 });
    }

    try {
      const body = await request.json();

      // Extraer mensaje - compatible con múltiples formatos de Kommo
      const mensaje = body.message || body.data?.message || body.text || '';

      if (!mensaje) {
        return new Response(JSON.stringify({ response: 'No se recibió mensaje' }), {
          status: 200, headers: corsHeaders
        });
      }

      // Llamar a Dify API (sincrónico - espera la respuesta)
      const difyResponse = await fetch('https://api.dify.ai/v1/chat-messages', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + env.DIFY_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: {},
          query: mensaje,
          response_mode: 'blocking',
          conversation_id: body.conversation_id || '',
          user: 'kommo-user-' + (body.contact_id || Date.now())
        })
      });

      const difyData = await difyResponse.json();
      const respuestaIA = difyData.answer || 'Lo siento, no pude procesar tu mensaje.';

      // Devolver respuesta directa para Salesbot webhook
      return new Response(JSON.stringify({
        response: respuestaIA,
        conversation_id: difyData.conversation_id || ''
      }), {
        status: 200, headers: corsHeaders
      });

    } catch (error) {
      return new Response(JSON.stringify({
        response: 'Dame un momento que te conecto con alguien del equipo'
      }), {
        status: 200, headers: corsHeaders
      });
    }
  }
};
