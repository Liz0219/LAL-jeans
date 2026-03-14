export default {
  async fetch(request, env, ctx) {
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

      // Extraer mensaje y return_url del request
      const mensaje = body.data?.message || body.message || body.text || '';
      const returnUrl = body.return_url || '';

      // Si hay return_url = viene del Salesbot widget_request
      // Responder rápido y procesar async
      if (returnUrl) {
        ctx.waitUntil(procesarConDify(mensaje, returnUrl, env));
        return new Response(JSON.stringify({ status: 'received' }), {
          status: 200, headers: corsHeaders
        });
      }

      // Sin return_url = llamada directa, responder sincrónicamente
      if (!mensaje) {
        return new Response(JSON.stringify({ response: 'No se recibió mensaje' }), {
          status: 200, headers: corsHeaders
        });
      }

      const respuestaIA = await llamarDify(mensaje, env);

      return new Response(JSON.stringify({
        response: respuestaIA
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

async function llamarDify(mensaje, env) {
  try {
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
        conversation_id: '',
        user: 'kommo-user-' + Date.now()
      })
    });

    const difyData = await difyResponse.json();
    return difyData.answer || 'Lo siento, no pude procesar tu mensaje.';
  } catch (error) {
    return 'Dame un momento que te conecto con alguien del equipo';
  }
}

async function procesarConDify(mensaje, returnUrl, env) {
  try {
    const respuestaIA = await llamarDify(mensaje, env);

    // Enviar respuesta de vuelta al Salesbot via return_url
    await fetch(returnUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: { status: 'success' },
        execute_handlers: [
          {
            handler: 'show',
            params: {
              type: 'text',
              value: respuestaIA
            }
          }
        ]
      })
    });
  } catch (error) {
    // Si hay error, enviar mensaje de respaldo
    if (returnUrl) {
      await fetch(returnUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: { status: 'error' },
          execute_handlers: [
            {
              handler: 'show',
              params: {
                type: 'text',
                value: 'Dame un momento que te conecto con alguien del equipo'
              }
            }
          ]
        })
      });
    }
  }
}
