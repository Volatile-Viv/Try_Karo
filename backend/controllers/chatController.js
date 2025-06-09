const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

/**
 * Process a chat message through the Groq API and return the response
 * @route POST /api/chat/message
 * @access Public
 */
const getChatResponse = async (req, res) => {
  try {
    const { message, messages } = req.body;

    console.log("Received chat request:", {
      message,
      messagesCount: messages?.length,
    });

    if (!message && (!messages || !messages.length)) {
      return res.status(400).json({ error: "Message is required" });
    }

    const conversationHistory = messages || [];

    // Prepare messages for Groq API
    const apiMessages = [
      // Add system message to instruct the AI to only answer website-related queries
      {
        role: "system",
        content: `You are a helpful assistant for the "Try Karo" website, a product testing and review platform. Your primary purpose is to answer questions related to our website, its features, products, services, and how to use them.

ABOUT TRY KARO:
Try Karo is a platform that connects brands with users who want to test and review their products. Users can browse available products, request to try them, and then write reviews after testing. Brands can list their products for testing, track reviews, and gain valuable feedback.

WEBSITE FEATURES:
- Product browsing: Users can browse products by categories (like electronics, fashion, beauty, etc.)
- Product filtering: Users can filter by categories and status
- Product search: Users can search for specific products
- User accounts: Users can register, login, and manage their profile
- Cart: Users can add products to their cart for testing
- Reviews: Users can write and read reviews for products
- Brand dashboard: Brands can manage their products and view reviews

USER ROLES:
- Regular users: Can browse products, request to test them, and write reviews
- Brands: Can add products for testing and view feedback
- Admins: Can manage the entire platform

IMPORTANT INSTRUCTIONS:
1. ONLY answer questions related to Try Karo, its content, features, navigation, products, or services.
2. If a user asks a question that is not related to the website, politely explain that you can only help with website-related queries.
3. For non-website questions, suggest that they browse the website for more information about Try Karo's services.
4. Be friendly, concise, and helpful for all website-related questions.
5. Do not provide any information about other topics, even if the user insists.
6. Do not engage in political discussions, provide medical advice, or assist with illegal activities.
7. Always give short and concise answers. Use minimum words as possible

Example acceptable topics: how to navigate the website, product information, how to request a product for testing, account setup, login issues, how to write reviews, etc.`,
      },
    ];

    // Add conversation history
    apiMessages.push(
      ...conversationHistory.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      }))
    );

    // Add the new message if provided separately
    if (message) {
      apiMessages.push({
        role: "user",
        content: message,
      });
    }

    // For debugging - if no API key is set, return a test response
    if (
      !process.env.GROQ_API_KEY ||
      process.env.GROQ_API_KEY === "your_groq_api_key_here"
    ) {
      console.log("No GROQ_API_KEY set, returning test response");
      return res.status(200).json({
        text: "This is a test response. I can only answer questions related to this website. Please set GROQ_API_KEY in your .env file to enable real AI responses.",
        sender: "agent",
      });
    }

    console.log(
      "Calling Groq API with model:",
      process.env.GROQ_MODEL || "llama3-8b-8192"
    );

    // Call Groq API
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: process.env.GROQ_MODEL || "llama3-8b-8192",
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 1024,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Extract the response text
    const responseText = response.data.choices[0].message.content;
    console.log("Received response from Groq API");

    return res.status(200).json({
      text: responseText,
      sender: "agent",
    });
  } catch (error) {
    console.error("Chat API Error:", error.response?.data || error.message);
    return res.status(500).json({
      error: "Failed to get response from AI",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  getChatResponse,
};
