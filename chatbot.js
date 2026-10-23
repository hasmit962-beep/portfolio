/* =========================================================
   READVAULT / PORTFOLIO AI CHATBOT
   Owner: Hasmit Yadav
   API requests, message handling and error management
   ========================================================= */

(() => {
    "use strict";

    /* =========================
       1. GET HTML ELEMENTS
       ========================= */

    const chatInput = document.getElementById("userInput");
    const chatButton = document.getElementById("sendButton");
    const chatMessages = document.getElementById("chatMessages");
    const chatStatus = document.getElementById("chatStatus");


    /* =========================
       2. CHECK REQUIRED ELEMENTS
       ========================= */

    if (!chatInput || !chatButton || !chatMessages || !chatStatus) {
        console.error(
            "Chatbot initialization failed: Required HTML elements are missing."
        );

        return;
    }


    /* =========================
       3. PORTFOLIO INFORMATION
       ========================= */

    const portfolioContext = `
Portfolio Owner: Hasmit Yadav.

Education:
Hasmit is a B.Tech Computer Science and Engineering student at
JECRC University, Jaipur, India, specializing in Artificial
Intelligence and Machine Learning.

Technical Interests:
Hasmit is interested in programming, web development,
artificial intelligence, machine learning, and building
useful software projects.

Technical Skills and Learning Areas:
The portfolio covers HTML, CSS, JavaScript, Python, Git,
GitHub, API integration, and basic Node.js.
Do not exaggerate Hasmit's proficiency in any technology.
When asked about experience or expertise, do not invent details.

Projects:

1. ReadVault — Book Reading List Application
A book-management application for organizing a personal
book collection and tracking reading progress.
Its interface includes reading categories, book statistics,
reading goals, book details, and progress tracking.

2. Python Programming Practice
A collection of programming practice exercises, including
fundamental Python concepts and Fibonacci-related exercises.

3. Python Code Improvement and Debugging
Practice involving code improvement, debugging, testing,
and AI-assisted programming.

4. Interactive Quiz Application
A project focused on building an interactive quiz experience.

Portfolio:
https://my-portfolio-woad-six-75.vercel.app

Important Instructions:
- The portfolio owner is Hasmit Yadav.
- Never identify the portfolio owner as Rohit Raj or another person.
- Answer questions using the information provided in this context.
- Do not invent academic grades, work experience, internships,
  certifications, achievements, contact details, or personal history.
- Do not invent GitHub repository URLs or claim that an unverified
  repository belongs to Hasmit.
- If information is unavailable, clearly say that it is not
  specified in the portfolio.
- Be friendly, concise, professional, and helpful.
- If asked about a project, explain its purpose and the features
  listed in this context.
- Do not claim that you personally performed actions or accessed
  private information.
`;


    /* =========================
       4. CHAT STATE
       ========================= */

    let isSending = false;


    /* =========================
       5. DISPLAY CHAT MESSAGE
       ========================= */

    function showChatMessage(role, text) {
        if (!text || typeof text !== "string") {
            return;
        }

        const message = document.createElement("div");

        message.classList.add("chat-message");

        if (role === "user") {
            message.classList.add("chat-user");
        } else {
            message.classList.add("chat-assistant");
        }

        /*
         * Use textContent instead of innerHTML.
         * This prevents user input from being interpreted as HTML.
         */

        message.textContent = text;

        chatMessages.appendChild(message);

        /*
         * Scroll to the latest message.
         */

        chatMessages.scrollTo({
            top: chatMessages.scrollHeight,
            behavior: "smooth"
        });
    }


    /* =========================
       6. UPDATE CHAT STATUS
       ========================= */

    function updateChatStatus(message) {
        chatStatus.textContent = message;
    }


    /* =========================
       7. CONTROL INPUT STATE
       ========================= */

    function setSendingState(sending) {
        isSending = sending;

        chatButton.disabled = sending;
        chatInput.disabled = sending;

        chatButton.setAttribute(
            "aria-busy",
            String(sending)
        );

        chatInput.setAttribute(
            "aria-busy",
            String(sending)
        );

        if (sending) {
            updateChatStatus("AI is thinking...");
        } else {
            updateChatStatus("");
            chatInput.focus();
        }
    }


    /* =========================
       8. SEND MESSAGE TO API
       ========================= */

    async function sendChatMessage() {
        /*
         * Prevent empty messages and duplicate requests.
         */

        const question = chatInput.value.trim();

        if (!question || isSending) {
            return;
        }


        /*
         * Check whether the API configuration exists.
         */

        if (
            typeof CONFIG === "undefined" ||
            !CONFIG ||
            typeof CONFIG.endpoint !== "string" ||
            !CONFIG.endpoint.trim()
        ) {
            showChatMessage(
                "assistant",
                "The AI assistant is not configured yet. Please try again later."
            );

            updateChatStatus(
                "Chatbot endpoint is not configured."
            );

            return;
        }


        /*
         * Display the user's message.
         */

        showChatMessage("user", question);

        /*
         * Clear the input field.
         */

        chatInput.value = "";


        /*
         * Disable controls while waiting for the API.
         */

        setSendingState(true);


        try {
            /*
             * The API key must stay on the server.
             * Do not add private API keys to this file.
             */

            const response = await fetch(CONFIG.endpoint, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    question: question,
                    context: portfolioContext
                })
            });


            /* =========================
               9. HANDLE API ERRORS
               ========================= */

            if (response.status === 429) {
                throw new Error("RATE_LIMIT");
            }

            if (!response.ok) {
                throw new Error("API_ERROR");
            }


            /* =========================
               10. READ API RESPONSE
               ========================= */

            const data = await response.json();


            /*
             * Ensure the API returns a usable answer.
             */

            if (
                !data ||
                typeof data.answer !== "string" ||
                !data.answer.trim()
            ) {
                throw new Error("INVALID_RESPONSE");
            }


            /* =========================
               11. DISPLAY AI RESPONSE
               ========================= */

            showChatMessage(
                "assistant",
                data.answer.trim()
            );

            updateChatStatus("");


        } catch (error) {
            /*
             * Log technical details for debugging.
             * Do not expose server internals to visitors.
             */

            console.error("Chatbot request failed:", error);


            /* =========================
               12. USER-FRIENDLY ERRORS
               ========================= */

            if (error.message === "RATE_LIMIT") {
                showChatMessage(
                    "assistant",
                    "Too many requests have been made. Please wait a moment and try again."
                );

            } else if (!navigator.onLine) {
                showChatMessage(
                    "assistant",
                    "You appear to be offline. Please check your internet connection and try again."
                );

            } else if (error.message === "INVALID_RESPONSE") {
                showChatMessage(
                    "assistant",
                    "I received an unexpected response. Please try asking your question again."
                );

            } else {
                showChatMessage(
                    "assistant",
                    "The AI service is temporarily unavailable. Please try again in a moment."
                );
            }

            updateChatStatus("");

        } finally {
            /*
             * Re-enable the input and button after success or failure.
             */

            setSendingState(false);
        }
    }


    /* =========================
       13. SEND BUTTON EVENT
       ========================= */

    chatButton.addEventListener("click", sendChatMessage);


    /* =========================
       14. KEYBOARD SUPPORT
       ========================= */

    chatInput.addEventListener("keydown", (event) => {
        /*
         * Enter sends a message.
         * Shift + Enter can be used for a new line in a textarea.
         */

        if (
            event.key === "Enter" &&
            !event.shiftKey &&
            !event.isComposing
        ) {
            event.preventDefault();

            sendChatMessage();
        }
    });


    /* =========================
       15. INTERNET STATUS
       ========================= */

    window.addEventListener("offline", () => {
        updateChatStatus(
            "Internet connection lost."
        );
    });

    window.addEventListener("online", () => {
        if (!isSending) {
            updateChatStatus("");
        }
    });


    /* =========================
       16. INITIALIZATION
       ========================= */

    if (
        typeof CONFIG === "undefined" ||
        !CONFIG ||
        typeof CONFIG.endpoint !== "string" ||
        !CONFIG.endpoint.trim()
    ) {
        chatButton.disabled = true;

        updateChatStatus(
            "Chatbot endpoint is not configured."
        );

        console.warn(
            "Chatbot disabled: Check config.js and its endpoint setting."
        );
    }

})();