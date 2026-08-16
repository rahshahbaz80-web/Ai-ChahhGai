// ==========================================
// GEMINI AI BACKEND
// Cloudflare Pages Function
// functions/api/generate.js
// ==========================================

export async function onRequestPost(context) {

  try {

    // ======================================
    // GET REQUEST DATA
    // ======================================

    const body = await context.request.json();

    const prompt = body?.prompt;


    if (!prompt) {

      return new Response(
        JSON.stringify({
          success: false,
          error: "Prompt is required."
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

    }


    // ======================================
    // GET GEMINI API KEY
    // ======================================

    const apiKey =
      context.env.GEMINI_API_KEY;


    if (!apiKey) {

      return new Response(
        JSON.stringify({
          success: false,
          error:
            "GEMINI_API_KEY is not configured in Cloudflare."
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

    }


    // ======================================
    // GEMINI API REQUEST
    // ======================================

    const geminiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
      encodeURIComponent(apiKey);


    const geminiResponse =
      await fetch(
        geminiUrl,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ],

            generationConfig: {

              temperature: 0.8,

              topP: 0.95,

              topK: 40,

              maxOutputTokens: 4000

            }

          })
        }
      );


    // ======================================
    // READ GEMINI RESPONSE
    // ======================================

    const data =
      await geminiResponse.json();


    // ======================================
    // GEMINI ERROR
    // ======================================

    if (!geminiResponse.ok) {

      console.error(
        "Gemini API Error:",
        data
      );


      return new Response(
        JSON.stringify({
          success: false,
          error:
            data?.error?.message ||
            "Gemini API request failed."
        }),
        {
          status:
            geminiResponse.status,

          headers: {
            "Content-Type":
              "application/json"
          }
        }
      );

    }


    // ======================================
    // GET AI TEXT
    // ======================================

    const result =
      data
        ?.candidates?.[0]
        ?.content?.parts
        ?.map(part => part.text || "")
        ?.join("")
        ?.trim();


    // ======================================
    // EMPTY RESPONSE
    // ======================================

    if (!result) {

      console.error(
        "Empty Gemini response:",
        data
      );


      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Gemini returned an empty response."
        }),
        {
          status: 500,

          headers: {
            "Content-Type":
              "application/json"
          }
        }
      );

    }


    // ======================================
    // SUCCESS
    // ======================================

    return new Response(
      JSON.stringify({

        success: true,

        result: result

      }),
      {
        status: 200,

        headers: {
          "Content-Type":
            "application/json",

          "Cache-Control":
            "no-store"
        }
      }
    );


  } catch (error) {

    // ======================================
    // SERVER ERROR
    // ======================================

    console.error(
      "Backend Error:",
      error
    );


    return new Response(
      JSON.stringify({

        success: false,

        error:
          "Server error: " +
          error.message

      }),
      {
        status: 500,

        headers: {
          "Content-Type":
            "application/json"
        }
      }
    );

  }

}
