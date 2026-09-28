const sectionCards = document.querySelectorAll(".section-card");

let currentSection = "";
let editingIndex = null;
let autoSaveTimer = null;
let myAIConversationTopic = "";
let myAIFunMode = false;
let myAIFunRecentReplies = [];
let myAIGame = null;
let myAIGameScore = 0;
let myAIIQState = null;
let myAIVisitorName = localStorage.getItem("nasibehMyAIVisitorName") || "";

const MY_AI_SCORE_KEY = "nasibehMyAiArazScore";

function loadMyAIScore() {
    const savedScore = Number(localStorage.getItem(MY_AI_SCORE_KEY));
    return Number.isFinite(savedScore) && savedScore >= 0 ? savedScore : 0;
}

function saveMyAIScore() {
    localStorage.setItem(MY_AI_SCORE_KEY, String(myAIGameScore));
}

sectionCards.forEach((card) => {
    card.addEventListener("click", () => {
        const title = card.querySelector("strong")?.textContent?.trim();

        if (!title) return;

        if (title === "افزودن بخش") {
            addSection();
            return;
        }

        if (title === "Emoji Library") {
            openEmojiLibrary();
            return;
        }

        if (title === "My AI") {
            openMyAI();
            return;
        }

        openSection(title);
    });
});

function openMyAI() {
    myAIConversationTopic = "";
    myAIVisitorName = localStorage.getItem("nasibehMyAIVisitorName") || "";
    myAIGame = null;
    myAIGameScore = loadMyAIScore();

    document.querySelector(".app").innerHTML = `
        <header class="app-header">
            <button class="back-button" onclick="goHome()">←</button>
            <div>
                <h1>🤖 My AI</h1>
                <p>ذهنک من • دستیار شخصی</p>
            </div>
        </header>

        <section class="my-ai-page">

            <div class="my-ai-chat" id="myAiChat">
                <div class="my-ai-message ai-message">
                    <div class="my-ai-avatar">🤖</div>
                    <div class="my-ai-bubble">
                        سلام نسیبه 👋<br>
                        من My AI هستم. 🤖<br>
                        سازنده‌ی من نسیبه است و اسم My AI را هم خودش برای من انتخاب کرده. 🩷<br><br>
                        در چه زمینه‌ای می‌تونم کمکت کنم؟
                    </div>
                </div>
            </div>

            <div class="my-ai-input-area">
                <textarea
                    id="myAiInput"
                    class="my-ai-input"
                    rows="2"
                    placeholder="سؤالت را بنویس..."
                ></textarea>

                <button
                    id="myAiSend"
                    class="my-ai-send"
                    type="button"
                >
                    ارسال ➤
                </button>
            </div>
        </section>
    `;

    const input = document.getElementById("myAiInput");
    const sendButton = document.getElementById("myAiSend");
    const gameButtons = document.querySelectorAll(".araz-game-button");

    gameButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const game = button.dataset.game;

            if (game === "riddle") {
                if (myAIVisitorName === "آراز") {
                    const chat = document.getElementById("myAiChat");

                    chat.insertAdjacentHTML(
                        "beforeend",
                        `
                        <div class="my-ai-message ai-message">
                            <div class="my-ai-avatar">🤖</div>
                            <div class="my-ai-bubble">
                                ${startMyAIRiddleGame()}
                            </div>
                        </div>
                        `
                    );

                    chat.scrollTop = chat.scrollHeight;
                }
                return;
            }

            const chat = document.getElementById("myAiChat");

            chat.insertAdjacentHTML(
                "beforeend",
                `
                <div class="my-ai-message ai-message">
                    <div class="my-ai-avatar">🤖</div>
                    <div class="my-ai-bubble">
                        🚀 این بازی به‌زودی آماده می‌شه، قهرمان! 🧠🎮
                    </div>
                </div>
                `
            );

            chat.scrollTop = chat.scrollHeight;
        });
    });

    if (!input || !sendButton) return;

    sendButton.addEventListener("click", sendMyAIMessage);

    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMyAIMessage();
        }
    });

    input.focus();
}

function getMyAIKnowledgeList(message) {
    const text = normalizeMyAIText(message);

    const requests = [
        "چه اطلاعاتی داری",
        "چه چیزهایی بلدی",
        "چه چیزایی بلدی",
        "چه چیزهایی میدونی",
        "چه چیزایی میدونی",
        "چه چیزهایی می دانی",
        "چه چیزایی می دانی",
        "در چه زمینه هایی اطلاعات داری",
        "در چه زمینه ای اطلاعات داری",
        "چه موضوعاتی بلدی",
        "چه موضوع هایی بلدی",
        "چه چیزهایی میتونی",
        "چه چیزایی میتونی",
        "چه کارهایی بلدی",
        "چه کارایی بلدی"
    ];

    if (!requests.some((item) => text === normalizeMyAIText(item))) {
        return null;
    }

    return `🧠 <strong>این چیزهایی هست که در حال حاضر واقعاً می‌تونم انجام بدم:</strong><br><br>
    🧬 <strong>DNA، ژن و ژنتیک</strong><br>
    درباره DNA، ساختار کلی آن، ژن‌ها، ژنتیک و ارتباط بین این مفاهیم می‌تونم توضیح بدم و به سؤال‌های مرتبط پاسخ بدم.<br><br>

    🧫 <strong>سلول و یاخته</strong><br>
    درباره سلول، بخش‌های اصلی آن، هسته، DNA داخل سلول و نقش بعضی از اجزای سلول می‌تونم توضیح بدم.<br><br>

    🧮 <strong>محاسبات ریاضی و مسائل عددی</strong><br>
    جمع، تفریق، ضرب، تقسیم، درصد، توان و بعضی محاسبات عددی رو می‌تونم انجام بدم.<br><br>

    ⚖️ <strong>محاسبه اختلاف وزن</strong><br>
    می‌تونم اختلاف بین وزن‌ها رو، از جمله وزن‌های کیلوگرمی و گرمی، محاسبه کنم.<br><br>

    📝 <strong>اطلاعات ذخیره‌شده در ذهنک من</strong><br>
    می‌تونم اطلاعاتی رو که داخل یادداشت‌های ذهنک من ذخیره شده پیدا کنم و در پاسخ‌های مرتبط ازشون استفاده کنم.<br><br>

    🧠 <strong>تست هوش و چالش‌های فکری</strong><br>
    می‌تونم تست‌های هوش و بعضی چالش‌های فکری رو اجرا کنم و پاسخ‌ها رو بررسی کنم.<br><br>

    🧩 <strong>چیستان و معما</strong><br>
    می‌تونم چیستان و معما مطرح کنم، جواب‌ها رو بررسی کنم و در صورت درخواست جواب معما رو بگم.<br><br>

    🔤 <strong>بازی کلمات</strong><br>
    بازی‌های کلمه‌ای مثل پیدا کردن میوه، حیوان، کشور، وسیله و خوراکی با یک حرف مشخص.<br><br>

    🔢 <strong>بازی و چالش عددی</strong><br>
    می‌تونم چالش‌های عددی ساده برگزار کنم و برای پاسخ‌های درست امتیاز ثبت کنم.<br><br>

    🎭 <strong>گفت‌وگوی فان، شوخی و کل‌کل</strong><br>
    می‌تونم وارد گفت‌وگوی فان بشم، شوخی کنم، کل‌کل دوستانه داشته باشم و در بعضی موقعیت‌ها پاسخ‌های متنوع و بامزه بدم.<br><br>

    💬 <strong>گفت‌وگوی ساده و بعضی سؤال‌های عمومی</strong><br>
    درباره بعضی موضوعات عمومی می‌تونم گفت‌وگو کنم و اگر اطلاعات کافی نداشته باشم، صادقانه می‌گم که پاسخ کافی ندارم.<br><br>

    🌤️ <strong>هوا، ساعت و تاریخ</strong><br>
    می‌تونم سؤال مربوط به هوا، ساعت و تاریخ رو تشخیص بدم، اما برای ارائه اطلاعات دقیق و لحظه‌ای درباره این موارد به منبع زنده نیاز دارم.<br><br>

    📚 <strong>یادگیری از اطلاعات ذخیره‌شده</strong><br>
    اگر اطلاعات جدیدی داخل یادداشت‌های ذهنک من ذخیره کنی، می‌تونم بعداً در سؤال‌های مرتبط از همان اطلاعات استفاده کنم.<br><br>

    🤖 <strong>اگر سؤال خارج از توانایی‌های فعلی من باشد...</strong><br>
    وانمود نمی‌کنم که جوابش رو می‌دونم؛ می‌گم که در حال حاضر اطلاعات یا قابلیت کافی برای پاسخ دقیق به اون سؤال ندارم.`;
}

function sendMyAIMessage() {
    const input = document.getElementById("myAiInput");
    const chat = document.getElementById("myAiChat");

    if (!input || !chat) return;

    const message = input.value.trim();

    if (!message) return;

    chat.insertAdjacentHTML(
        "beforeend",
        `
        <div class="my-ai-message user-message">
            <div class="my-ai-bubble">${escapeHtml(message)}</div>
        </div>
        `
    );

    input.value = "";

    const visitorGreeting = getMyAIVisitorGreeting(message);
    const scoreRequest = getMyAIScoreRequest(message);
    const wordGameRequest = getMyAIWordGameRequest(message);
    const riddleRequest = getMyAIRiddleRequest(message);
    const numberGameRequest = getMyAINumberGameRequest(message);
    const wordGameResponse = tryMyAIWordGame(message);
    const numberGameResponse = tryMyAINumberGame(message);
    const riddleGameResponse = tryMyAIRiddleGame(message);
    const gameExitRequest = getMyAIGameExitRequest(message);
    const iqRequest = getMyAIIQRequest(message);
    const iqAnswerRequest = getMyAIIQAnswerRequest(message);
    const iqGameWasActive = !!(myAIIQState && myAIIQState.active); const iqGameResponse = iqGameWasActive ? tryMyAIIQGame(message) : null;
    const timeDateResponse = getMyAITimeDateResponse(message);
    const scienceResponse = getMyAIScienceResponse(message);
    const funResponse = getMyAIFunResponse(message);
    const weightMathResponse = tryMyAIWeightMath(message);
    const mathResponse = tryMyAIMath(message);
    const topicPrompt = getMyAITopicPrompt(message);
    const smallTalkResponse = getMyAISmallTalkResponse(message);
    const knowledgeListResponse = getMyAIKnowledgeList(message);

    let response = "";

    if (gameExitRequest) {
        response = gameExitRequest;
    } else if (iqRequest) {
        response = iqRequest;
    } else if (iqAnswerRequest) {
        response = iqAnswerRequest;
    } else if (iqGameResponse) {
        response = iqGameResponse;
    } else 
    if (wordGameRequest) {
        response = wordGameRequest;
    } else if (wordGameResponse) {
        response = wordGameResponse;
    } else if (numberGameRequest) {
        response = numberGameRequest;
    } else if (numberGameResponse) {
        response = numberGameResponse;
    } else if (riddleGameResponse) {
        response = riddleGameResponse;
    } else if (riddleRequest) {
        response = riddleRequest;
    } else if (weightMathResponse) {
        response = weightMathResponse;
    } else if (mathResponse) {
        response = mathResponse;
    } else if (timeDateResponse) {
        response = timeDateResponse;
    } else if (scienceResponse) {
        response = scienceResponse;
    } else if (funResponse) {
        response = funResponse;
    } else if (knowledgeListResponse) {
        response = knowledgeListResponse;
    } else if (scoreRequest) {
        response = scoreRequest;
    } else if (visitorGreeting) {
        response = visitorGreeting;
    } else if (smallTalkResponse) {
        response = smallTalkResponse;
    } else if (
        getMyAIContext().some(
            (item) =>
                normalizeMyAIText(item.title) ===
                normalizeMyAIText(message)
        )
    ) {
        const exactTitle = normalizeMyAIText(message);

        const exactNote = getMyAIContext().find(
            (item) =>
                normalizeMyAIText(item.title) === exactTitle
        );

        response = `
            📝 <strong>${escapeHtml(exactNote.title)}</strong>
            <br><br>
            ${escapeHtml(exactNote.text).replace(/\n/g, "<br>")}
        `;
    } else if (topicPrompt) {
        if (myAIConversationTopic) {
            myAIConversationTopic = `${myAIConversationTopic} ${message}`;
        } else {
            myAIConversationTopic = message;
        }

        response = topicPrompt;
    } else {
        const exactTitle = normalizeMyAIText(message);

        const exactNote = getMyAIContext().find((item) => {
            return (
                exactTitle &&
                normalizeMyAIText(item.title) === exactTitle
            );
        });

        if (exactNote) {
            response = `
                📝 <strong>${escapeHtml(exactNote.title)}</strong>
                <br><br>
                ${escapeHtml(exactNote.text).replace(/\n/g, "<br>")}
            `;
        } else {
            response = getMyAIGeneralResponse(message);
        }
    }

    const responseId = "my-ai-response-" + Date.now();

    chat.insertAdjacentHTML(
        "beforeend",
        `
        <div class="my-ai-message ai-message">
            <div class="my-ai-avatar">🤖</div>
            <div>
                <div class="my-ai-bubble" id="${responseId}">
                    <button
                        type="button"
                        class="my-ai-copy-button"
                        aria-label="کپی پاسخ"
                    >⧉</button>
                    <div class="my-ai-response-content">
                        ${response}
                    </div>
                </div>
            </div>
        </div>
        `
    );

    const responseBubble = document.getElementById(responseId);
    const copyButton = responseBubble?.parentElement?.querySelector(
        ".my-ai-copy-button"
    );

    if (responseBubble && copyButton) {
        copyButton.addEventListener("click", async () => {
            const textToCopy = responseBubble.innerText.trim();

            try {
                await navigator.clipboard.writeText(textToCopy);
            } catch (error) {
                const textArea = document.createElement("textarea");
                textArea.value = textToCopy;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand("copy");
                textArea.remove();
            }

            copyButton.textContent = "✓";

            setTimeout(() => {
                copyButton.textContent = "⧉";
            }, 1500);
        });
    }

    chat.scrollTop = chat.scrollHeight;
}

function extractRelevantText(text, query) {
    const normalize = (value) => {
        return String(value || "")
            .toLowerCase()
            .replace(/[ًٌٍَُِّْـ]/g, "")
            .replace(/ي/g, "ی")
            .replace(/ى/g, "ی")
            .replace(/ك/g, "ک")
            .replace(/ۀ/g, "ه")
            .replace(/ة/g, "ه")
            .replace(/[\u200c\u200d\u200e\u200f]/g, " ")
            .replace(/[\u00a0]/g, " ")
            .replace(/[؟،,.!?؛:()"'«»]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    };

    const normalizedQuery = normalize(query);

    const lines = String(text)
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    if (lines.length === 0) {
        return "";
    }

    const stopWords = new Set([
        "من", "ما", "تو", "شما", "او", "این", "اون",
        "برای", "رو", "را", "از", "به", "در", "با",
        "که", "چی", "چیه", "چیست", "چقدر", "چند",
        "مقدار", "میزان", "می", "میخوام", "می‌خوام",
        "میخواهم", "می‌خواهم", "یه", "یک", "هم", "همه",
        "دارم", "داریم", "بود", "هست", "است",
        "لطفا", "لطفاً", "برام", "چطور", "چجوری",
        "چگونه", "میشه", "میشود", "درباره"
    ]);

    const words = normalizedQuery
        .split(/\s+/)
        .filter((word) =>
            word.length > 1 && !stopWords.has(word)
        );

    const findSection = (headings) => {
        for (let i = 0; i < lines.length; i++) {
            const current = normalize(lines[i]);

            if (!headings.some((heading) =>
                current === normalize(heading)
            )) {
                continue;
            }

            let endIndex = lines.length;

            for (let j = i + 1; j < lines.length; j++) {
                const next = normalize(lines[j]);

                if (
                    next.length <= 45 &&
                    !/[.!؟،:؛]$/.test(next) &&
                    headings.some((heading) =>
                        next === normalize(heading)
                    )
                ) {
                    endIndex = j;
                    break;
                }

                const allHeadings = [
                    "مواد لازم",
                    "مواد اولیه",
                    "ترکیبات",
                    "مراحل آماده سازی",
                    "مراحل آمادهسازی",
                    "طرز تهیه",
                    "شکل دادن",
                    "خشک کردن"
                ];

                if (
                    next.length <= 45 &&
                    allHeadings.some((heading) =>
                        next === normalize(heading)
                    )
                ) {
                    endIndex = j;
                    break;
                }
            }

            return lines.slice(i, endIndex).join("\n");
        }

        return "";
    };

    const amountKeywords = [
        "چقدر",
        "مقدار",
        "میزان",
        "چند گرم",
        "چند کیلو",
        "هر وعده",
        "در هر وعده",
        "وعده",
        "مصرف",
        "سهم",
        "اندازه مصرف",
        "چه مقدار",
        "چه میزان",
        "چقدر بدم",
        "چقدر استفاده",
        "چقدر مصرف"
    ];

    const isAmountQuestion = amountKeywords.some((keyword) =>
        normalizedQuery.includes(normalize(keyword))
    );

    if (isAmountQuestion) {
        const hasMealQuestion =
            normalizedQuery.includes("هر وعده") ||
            normalizedQuery.includes("در هر وعده") ||
            normalizedQuery.includes("وعده") ||
            normalizedQuery.includes("چند گرم بدم") ||
            normalizedQuery.includes("چقدر بدم");

        if (hasMealQuestion) {
            const mealLines = lines.filter((line) => {
                const value = normalize(line);

                return (
                    value.includes("وعده") &&
                    (
                        value.includes("گرم") ||
                        value.includes("کیلو") ||
                        value.includes("عدد") ||
                        /\d/.test(value)
                    )
                );
            });

            if (mealLines.length > 0) {
                return mealLines.join("\n");
            }
        }

        const dailyQuestion =
            normalizedQuery.includes("روزانه") ||
            normalizedQuery.includes("در روز") ||
            normalizedQuery.includes("هر روز") ||
            normalizedQuery.includes("مقدار روزانه") ||
            normalizedQuery.includes("مصرف روزانه");

        if (dailyQuestion) {
            const dailyLines = lines.filter((line) => {
                const value = normalize(line);

                return (
                    value.includes("گرم/روز") ||
                    value.includes("گرم / روز") ||
                    value.includes("گرم روز") ||
                    /گرم\s*[/\s]\s*روز/.test(value)
                );
            });

            if (dailyLines.length > 0) {
                return dailyLines.join("\n");
            }
        }

        const matchedAmountLines = lines.filter((line) => {
            const value = normalize(line);

            return (
                value.includes("وعده") ||
                value.includes("گرم") ||
                value.includes("کیلو") ||
                value.includes("مصرف") ||
                value.includes("سهم")
            );
        });

        if (matchedAmountLines.length > 0) {
            return matchedAmountLines.slice(0, 5).join("\n");
        }
    }

    const weightQuestion =
        normalizedQuery.includes("وزن") ||
        normalizedQuery.includes("کیلو") ||
        normalizedQuery.includes("کیلوگرم") ||
        normalizedQuery.includes("چند کیلو");

    if (weightQuestion) {
        const weightLines = lines.filter((line) => {
            const value = normalize(line);

            return (
                value.includes("وزن") ||
                value.includes("کیلوگرم") ||
                value.includes("کیلو")
            );
        });

        if (weightLines.length > 0) {
            return weightLines.slice(0, 5).join("\n");
        }
    }

    const sectionIntents = [
        {
            keywords: [
                "مواد لازم", "مواد اولیه", "ترکیبات",
                "چی لازم دارم", "چه چیزهایی لازم",
                "چی لازم", "موادش"
            ],
            headings: [
                "مواد لازم", "مواد اولیه", "ترکیبات"
            ]
        },
        {
            keywords: [
                "طرز تهیه", "مراحل آماده سازی",
                "روش تهیه", "چطور درست",
                "چجوری درست", "چگونه درست",
                "آماده کنم", "آماده سازی",
                "روش انجام", "روش کار",
                "نحوه انجام", "نحوه تهیه",
                "نحوه درست کردن", "روش درست کردن",
                "مراحل کار", "مراحل انجام",
                "دستور تهیه", "دستور پخت"
            ],
            headings: [
                "طرز تهیه", "مراحل آماده سازی",
                "روش تهیه", "آماده سازی",
                "روش انجام", "روش کار",
                "نحوه انجام", "نحوه تهیه",
                "مراحل کار", "مراحل انجام",
                "دستور تهیه", "دستور پخت"
            ]
        },
        {
            keywords: [
                "شکل دادن", "چه شکلی",
                "اندازه", "ضخامت", "قطر"
            ],
            headings: [
                "شکل دادن"
            ]
        },
        {
            keywords: [
                "خشک کردن", "چطور خشک",
                "چجوری خشک", "دمای خشک",
                "ایرفرایر", "میوه خشک کن"
            ],
            headings: [
                "خشک کردن"
            ]
        }
    ];

    for (const intent of sectionIntents) {
        if (
            intent.keywords.some((keyword) =>
                normalizedQuery.includes(normalize(keyword))
            )
        ) {
            const section = findSection(intent.headings);

            if (section) {
                return section;
            }
        }
    }

    if (words.length === 0) {
        return lines.slice(0, 6).join("\n");
    }

    const matched = lines
        .map((line, index) => {
            const normalizedLine = normalize(line);
            let score = 0;

            words.forEach((word) => {
                if (normalizedLine.includes(word)) {
                    score++;
                }
            });

            return {
                line,
                index,
                score
            };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }

            return a.index - b.index;
        });

    if (matched.length === 0) {
        return lines.slice(0, 6).join("\n");
    }

    return matched
        .slice(0, 6)
        .sort((a, b) => a.index - b.index)
        .map((item) => item.line)
        .join("\n");
}
function getMyAIContext() {
    const allNotes = JSON.parse(
        localStorage.getItem("nasibehMyAiNotes") || "{}"
    );

    const context = [];

    Object.keys(allNotes).forEach((sectionName) => {
        const notes = allNotes[sectionName] || [];

        notes.forEach((note) => {
            context.push({
                section: sectionName,
                title: note.title || "",
                text: note.text || ""
            });
        });
    });

    return context;
}

function detectMyAITopic(message) {
    const context = sourceContext || getMyAIContext();

    const normalize = (value) => {
        return String(value || "")
            .toLowerCase()
            .replace(/[ًٌٍَُِّْـ]/g, "")
            .replace(/ي/g, "ی")
            .replace(/ى/g, "ی")
            .replace(/ك/g, "ک")
            .replace(/ۀ/g, "ه")
            .replace(/ة/g, "ه")
            .replace(/[\u200c\u200d\u200e\u200f]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    };

    const query = normalize(message);

    if (!query) {
        return "";
    }

    const matches = context
        .map((item) => {
            const section = normalize(item.section);
            const title = normalize(item.title);

            let score = 0;

            if (query === section) {
                score += 20;
            }

            if (query === title) {
                score += 20;
            }

            if (section.includes(query)) {
                score += 10;
            }

            if (title.includes(query)) {
                score += 10;
            }

            return {
                section: item.section,
                title: item.title,
                score
            };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score);

    if (matches.length === 0) {
        return "";
    }

    return matches[0].section || matches[0].title;
}

function getMyAISectionEmoji(sectionName) {
    const defaultEmojis = {
        "اطلاعات من": "👤",
        "اودی": "🐶",
        "برنامه‌نویسی": "💻",
        "آشپزی": "🍳",
        "عروس هلندی": "🦜",
        "کیک": "🎂",
        "شرکت": "🏢",
        "فیلم و سریال": "🎬",
        "ایده‌ها": "💡"
    };

    const savedEmojis = JSON.parse(
        localStorage.getItem("nasibehMyAiSectionEmojis") || "{}"
    );

    return savedEmojis[sectionName] || defaultEmojis[sectionName] || "📁";
}


function getMyAITimeDateResponse(message) {
    const text = normalizeMyAIText(message);

    const timeRequests = [
        "ساعت چنده",
        "ساعت چند است",
        "ساعت چند هست",
        "الان ساعت چنده",
        "الان ساعت چند است",
        "الان ساعت چند هست",
        "ساعت الان چنده",
        "ساعت فعلی چنده",
        "زمان الان چنده"
    ];

    const dateRequests = [
        "امروز چندمه",
        "امروز چندم است",
        "امروز چندم هست",
        "تاریخ امروز چیه",
        "تاریخ امروز چیست",
        "امروز چه تاریخی است",
        "امروز چه روزیه",
        "امروز چه روزی است"
    ];

    const wantsTime = timeRequests.some(
        (item) => text === normalizeMyAIText(item)
    );

    const wantsDate = dateRequests.some(
        (item) => text === normalizeMyAIText(item)
    );

    if (!wantsTime && !wantsDate) {
        return null;
    }

    const now = new Date();

    const time = now.toLocaleTimeString("fa-IR", {
        hour: "2-digit",
        minute: "2-digit"
    });

    const date = now.toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    const weekday = now.toLocaleDateString("fa-IR", {
        weekday: "long"
    });

    if (wantsTime && wantsDate) {
        return `🕐 ساعت الان: <strong>${time}</strong><br>📅 امروز: <strong>${weekday}، ${date}</strong>`;
    }

    if (wantsTime) {
        return `🕐 ساعت الان: <strong>${time}</strong>`;
    }

    return `📅 امروز <strong>${weekday}</strong> است.<br>🗓️ تاریخ: <strong>${date}</strong>`;
}

function getMyAIScienceResponse(message) {
    const text = normalizeMyAIText(message);

    const dnaQuestions = [
        "dna چیست",
        "dna چیه",
        "دی ان ای چیست",
        "دی ان ای چیه",
        "dna یعنی چه",
        "dna یعنی چی"
    ];

    const dnaNames = [
        "dna",
        "دی ان ای",
        "دنا"
    ];

    if (
        dnaNames.some((name) => text === normalizeMyAIText(name)) ||
        dnaQuestions.some((q) => text === normalizeMyAIText(q))
    ) {
        return `🧬 <strong>DNA چیست؟</strong><br><br>
        DNA یا «دِنا» مولکولی است که بخش بزرگی از اطلاعات ژنتیکی موجود در سلول‌های جانداران را در خود نگه می‌دارد.
        می‌توان DNA را مثل یک دستورالعمل بسیار بزرگ در نظر گرفت که اطلاعات لازم برای ساخت و فعالیت بسیاری از بخش‌های بدن را در خود دارد.<br><br>
        DNA از واحدهای کوچکی به نام <strong>نوکلئوتید</strong> ساخته شده و چهار نوع باز اصلی دارد: A، T، C و G.
        ترتیب این بازها بخشی از اطلاعات ژنتیکی را تشکیل می‌دهد.<br><br>
        بیشتر DNA سلول‌های بدن انسان داخل <strong>هسته سلول</strong> قرار دارد و ساختار آن به شکل یک <strong>مارپیچ دوگانه</strong> است.`;
    }

    const dnaStructureQuestions = [
        "dna از چه چیزی ساخته شده",
        "دی ان ای از چه چیزی ساخته شده",
        "dna از چی ساخته شده",
        "ساختار dna چیست",
        "ساختار دی ان ای چیست"
    ];

    if (dnaStructureQuestions.some((q) => text === normalizeMyAIText(q))) {
        return `🧬 <strong>DNA از چه چیزی ساخته شده است؟</strong><br><br>
        DNA از واحدهایی به نام <strong>نوکلئوتید</strong> ساخته شده است.
        هر نوکلئوتید شامل یک قند، یک گروه فسفات و یکی از چهار باز نیتروژنی A، T، C یا G است.<br><br>
        دو رشته DNA در کنار هم قرار می‌گیرند و ساختار معروف <strong>مارپیچ دوگانه</strong> را تشکیل می‌دهند.`;
    }

    const geneQuestions = [
        "ژن چیست",
        "ژن چیه",
        "ژن یعنی چه",
        "ژن یعنی چی",
        "gene چیست",
        "gene چیه"
    ];

    if (geneQuestions.some((q) => text === normalizeMyAIText(q))) {
        return `🧬 <strong>ژن چیست؟</strong><br><br>
        ژن بخشی از DNA است که اطلاعات لازم برای یک کار زیستی مشخص را در خود دارد.
        بسیاری از ژن‌ها دستورالعمل ساخت پروتئین‌ها یا مولکول‌های مهم دیگر را در خود نگه می‌دارند.<br><br>
        ژن‌ها می‌توانند در ویژگی‌های مختلف بدن و نحوه عملکرد سلول‌ها نقش داشته باشند.
        به زبان ساده، <strong>DNA مانند یک کتاب بزرگ اطلاعاتی و ژن‌ها مانند بخش‌های مشخصی از آن کتاب هستند.</strong>`;
    }

    const geneticsQuestions = [
        "ژنتیک چیست",
        "ژنتیک چیه",
        "ژنتیک یعنی چه",
        "ژنتیک یعنی چی",
        "علم ژنتیک چیست"
    ];

    if (geneticsQuestions.some((q) => text === normalizeMyAIText(q))) {
        return `🧬 <strong>ژنتیک چیست؟</strong><br><br>
        ژنتیک شاخه‌ای از علم زیست‌شناسی است که درباره <strong>ژن‌ها، DNA و وراثت</strong> مطالعه می‌کند.<br><br>
        ژنتیک بررسی می‌کند ویژگی‌های زیستی چگونه از والدین به فرزندان منتقل می‌شوند و تغییرات موجود در ژن‌ها چگونه می‌توانند روی ویژگی‌ها و عملکرد بدن اثر بگذارند.<br><br>
        به زبان ساده، ژنتیک به ما کمک می‌کند بفهمیم اطلاعات زیستی چگونه در نسل‌ها منتقل می‌شود.`;
    }

    const dnaLocationQuestions = [
        "dna کجاست",
        "دی ان ای کجاست",
        "dna کجا قرار دارد",
        "دی ان ای کجا قرار دارد",
        "dna داخل کجاست"
    ];

    if (dnaLocationQuestions.some((q) => text === normalizeMyAIText(q))) {
        return `🧬 <strong>DNA کجای سلول قرار دارد؟</strong><br><br>
        در سلول‌های انسان، بیشتر DNA داخل <strong>هسته سلول</strong> قرار دارد.
        مقدار کمی DNA هم در اندامک‌هایی به نام <strong>میتوکندری</strong> وجود دارد.<br><br>
        هسته مثل یک مرکز نگهداری اطلاعات ژنتیکی سلول عمل می‌کند.`;
    }

    const cellQuestions = [
        "سلول چیست",
        "سلول چیه",
        "یاخته چیست",
        "یاخته چیه",
        "سلول یعنی چه",
        "سلول یعنی چی",
        "یاخته یعنی چه",
        "یاخته یعنی چی"
    ];

    if (cellQuestions.some((q) => text === normalizeMyAIText(q))) {
        return `🧫 <strong>سلول یا یاخته چیست؟</strong><br><br>
        سلول کوچک‌ترین واحدی است که می‌تواند ویژگی‌های اصلی حیات را داشته باشد.
        بدن انسان از تعداد بسیار زیادی سلول ساخته شده است.<br><br>
        سلول‌ها وظایف مختلفی دارند؛ برای مثال بعضی سلول‌ها در حرکت، بعضی در انتقال پیام‌های عصبی و بعضی در دفاع از بدن نقش دارند.<br><br>
        هر سلول مجموعه‌ای از بخش‌های مختلف دارد که با همکاری یکدیگر باعث فعالیت سلول می‌شوند.`;
    }

    const cellPartsQuestions = [
        "سلول چه بخش هایی دارد",
        "سلول چه بخشهایی دارد",
        "بخش های سلول چیست",
        "بخشهای سلول چیست",
        "اجزای سلول چیست",
        "اجزای یاخته چیست"
    ];

    if (cellPartsQuestions.some((q) => text === normalizeMyAIText(q))) {
        return `🧫 <strong>سلول چه بخش‌هایی دارد؟</strong><br><br>
        سلول‌های بدن انسان بخش‌های مختلفی دارند که هرکدام وظیفه‌ای دارند.<br><br>
        🔹 <strong>هسته:</strong> محل نگهداری بیشتر DNA و مرکز مهم کنترل فعالیت‌های سلول است.<br>
        🔹 <strong>غشای سلولی:</strong> مرز سلول است و ورود و خروج بسیاری از مواد را کنترل می‌کند.<br>
        🔹 <strong>سیتوپلاسم:</strong> محیط داخلی سلول است که بسیاری از فعالیت‌های سلولی در آن انجام می‌شود.<br>
        🔹 <strong>میتوکندری:</strong> در تولید انرژی مورد نیاز سلول نقش دارد.<br><br>
        البته سلول‌ها انواع مختلفی دارند و همه سلول‌ها دقیقاً ساختار یکسانی ندارند.`;
    }

    const nucleusQuestions = [
        "هسته سلول چیست",
        "هسته سلول چیه",
        "هسته یاخته چیست",
        "هسته چیست",
        "هسته چیه"
    ];

    if (nucleusQuestions.some((q) => text === normalizeMyAIText(q))) {
        return `🧫 <strong>هسته سلول چیست؟</strong><br><br>
        هسته یکی از بخش‌های مهم بسیاری از سلول‌های بدن انسان است.
        بیشتر DNA سلول درون هسته قرار دارد و هسته در کنترل بسیاری از فعالیت‌های سلول نقش دارد.<br><br>
        به همین دلیل می‌توان هسته را یکی از مهم‌ترین مراکز مدیریت اطلاعات و فعالیت‌های سلول دانست.`;
    }

    return null;
}
function getMyAITopicPrompt(message) {
    const context = getMyAIContext();

    const normalize = (value) => {
        return String(value || "")
            .toLowerCase()
            .replace(/[ًٌٍَُِّْـ]/g, "")
            .replace(/ي/g, "ی")
            .replace(/ى/g, "ی")
            .replace(/ك/g, "ک")
            .replace(/ۀ/g, "ه")
            .replace(/ة/g, "ه")
            .replace(/[\u200c\u200d\u200e\u200f]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    };

    const query = normalize(message);

    if (!query || query.split(/\s+/).length > 4) {
        return "";
    }

    const exactSection = context.find(
        (item) => normalize(item.section) === query
    );

    if (exactSection) {
        return `حتماً ${getMyAISectionEmoji(exactSection.section)} درباره کدوم موضوع ${escapeHtml(exactSection.section)} می‌خوای صحبت کنیم؟`;
    }

    const exactTitle = context.find(
        (item) => normalize(item.title) === query
    );

    if (exactTitle) {
        return `حتماً ${getMyAISectionEmoji(exactTitle.section)} درباره ${escapeHtml(exactTitle.title)} چه چیزی می‌خوای بدونی؟`;
    }

    return "";
}

function searchMyAIFocusedMemory(query, topic) {
    const context = getMyAIContext();

    const normalize = (value) => {
        return String(value || "")
            .toLowerCase()
            .replace(/[ًٌٍَُِّْـ]/g, "")
            .replace(/ي/g, "ی")
            .replace(/ى/g, "ی")
            .replace(/ك/g, "ک")
            .replace(/ۀ/g, "ه")
            .replace(/ة/g, "ه")
            .replace(/[\u200c\u200d\u200e\u200f]/g, " ")
            .replace(/[؟،,.!?؛:()"'«»]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    };

    const topicWords = normalize(topic)
        .split(/\s+/)
        .filter((word) => word.length > 1);

    if (topicWords.length === 0) {
        return searchMyAIMemory(query);
    }

    const focusedContext = context.filter((item) => {
        const section = normalize(item.section);
        const title = normalize(item.title);
        const combined = `${section} ${title}`;

        return topicWords.every((word) => combined.includes(word));
    });

    if (focusedContext.length === 0) {
        return [];
    }

    return searchMyAIMemory(query, focusedContext);
}

function searchMyAIMemory(query, sourceContext = null) {
    const context = sourceContext || getMyAIContext();

    const stopWords = new Set([
        "من", "ما", "تو", "شما", "او", "این", "اون",
        "برای", "رو", "را", "از", "به", "در", "با",
        "که", "چی", "چیه", "چیست", "چقدر", "چند",
        "مقدار", "میزان", "می", "میخوام", "می‌خوام",
        "میخواهم", "می‌خواهم", "یه", "یک", "هم", "همه",
        "دارم", "داریم", "بود", "هست", "است", "لطفا",
        "لطفاً", "برام", "درباره", "مورد", "رو", "را"
    ]);

    const synonymGroups = [
        ["وزن", "وزنش", "وزنِ", "کیلو", "کیلوگرم", "کیلوگرمی"],
        ["غذا", "غذای", "خوراک", "خوراکی"],
        ["سگ", "اودی", "اودی"],
        ["دستور", "طرز", "روش", "مراحل", "آماده", "آماده سازی", "آماده‌سازی"],
        ["مواد", "ماده", "موادلازم", "مواد لازم"],
        ["مصرف", "خوردن", "بخور", "بده", "دادن"],
        ["روزانه", "روز", "هرروز", "هر روز"],
        ["وعده", "وعدهها", "وعده‌ها"]
    ];

    const normalize = (value) => {
        return String(value || "")
            .toLowerCase()
            .replace(/[ًٌٍَُِّْـ]/g, "")
            .replace(/ي/g, "ی")
            .replace(/ى/g, "ی")
            .replace(/ك/g, "ک")
            .replace(/ۀ/g, "ه")
            .replace(/ة/g, "ه")
            .replace(/[\u200c\u200d\u200e\u200f]/g, " ")
            .replace(/[\u00a0]/g, " ")
            .replace(/[؟،,.!?؛:()"'«»]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    };

    const getTokens = (value) => {
        return normalize(value)
            .split(/\s+/)
            .map((word) => word.trim())
            .filter((word) => word.length > 1 && !stopWords.has(word));
    };

    const getRelatedTokens = (word) => {
        const related = new Set([word]);

        synonymGroups.forEach((group) => {
            if (group.includes(word)) {
                group.forEach((item) => related.add(item));
            }
        });

        return related;
    };

    const normalizedQuery = normalize(query);
    const words = getTokens(normalizedQuery);

    if (words.length === 0) {
        return [];
    }

    const queryPhrase = words.join(" ");
    const importantWordCount = words.length;

    return context
        .map((item) => {
            const section = normalize(item.section);
            const title = normalize(item.title);
            const content = normalize(item.text);

            let score = 0;
            let matchedWords = 0;
            let matchedGroups = 0;

            words.forEach((word) => {
                const relatedWords = getRelatedTokens(word);
                let matched = false;

                relatedWords.forEach((relatedWord) => {
                    if (title.includes(relatedWord)) {
                        score += 7;
                        matched = true;
                    } else if (section.includes(relatedWord)) {
                        score += 5;
                        matched = true;
                    } else if (content.includes(relatedWord)) {
                        score += 2;
                        matched = true;
                    }
                });

                if (matched && (title.includes(word) || section.includes(word))) { score += 6; }
                if (matched) {
                    matchedWords++;
                }

                const hasRelatedGroup = synonymGroups.some(
                    (group) =>
                        group.includes(word) &&
                        group.some(
                            (relatedWord) =>
                                title.includes(relatedWord) ||
                                section.includes(relatedWord) ||
                                content.includes(relatedWord)
                        )
                );

                if (hasRelatedGroup) {
                    matchedGroups++;
                }
            });

            if (title.includes(queryPhrase)) {
                score += 15;
            }

            if (content.includes(queryPhrase)) {
                score += 8;
            }

            const coverage = matchedWords / words.length;

            if (coverage < 0.25) {
                score = 0;
            }

            if (matchedGroups > 0) {
                score += matchedGroups * 3;
            }

            return {
                ...item,
                score,
                matchedWords,
                matchedGroups
            };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }

            if (b.matchedWords !== a.matchedWords) {
                return b.matchedWords - a.matchedWords;
            }

            return b.matchedGroups - a.matchedGroups;
        })
        .slice(0, 3);
}


function getMyAIQuestionType(query) {
    const text = String(query || "")
        .toLowerCase()
        .replace(/[ًٌٍَُِّْـ]/g, "")
        .replace(/ي/g, "ی")
        .replace(/ى/g, "ی")
        .replace(/ك/g, "ک")
        .replace(/ۀ/g, "ه")
        .replace(/ة/g, "ه")
        .replace(/[\u200c\u200d\u200e\u200f]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    if (!text) {
        return "empty";
    }

    if (getMyAISmallTalkResponse(text)) {
        return "small-talk";
    }

    const memoryResults = searchMyAIMemory(text);

    if (memoryResults.length > 0) {
        return "memory";
    }

    return "general";
}

function getMyAIGeneralResponse(query) {
    const text = String(query || "")
        .toLowerCase()
        .replace(/[ًٌٍَُِّْـ]/g, "")
        .replace(/ي/g, "ی")
        .replace(/ى/g, "ی")
        .replace(/ك/g, "ک")
        .replace(/ۀ/g, "ه")
        .replace(/ة/g, "ه")
        .replace(/[\u200c\u200d\u200e\u200f]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    if (text.includes("هوا")) {
        return "برای اینکه وضعیت هوای امروز را دقیق بگم، باید اطلاعات آب‌وهوا در دسترسم باشه. 🌤️";
    }

    if (text.includes("ساعت")) {
        return "برای گفتن ساعت دقیق، باید زمان فعلی دستگاه یا یک منبع زمان در دسترسم باشه. ⏰";
    }

    if (text.includes("تاریخ")) {
        return "برای گفتن تاریخ دقیق، باید تاریخ فعلی دستگاه در دسترسم باشه. 📅";
    }

    return `
        درباره این موضوع در یادداشت‌هایم اطلاعاتی ندارم. 🤖<br><br>
        اگر اطلاعاتی درباره‌اش به من اضافه کنی، می‌توانم بعداً در پاسخ‌هایم از آن استفاده کنم. 🩷
    `;
}



function getMyAINonRepeatingFunReply(replies) {
    if (!Array.isArray(replies) || replies.length === 0) {
        return "";
    }

    let available = replies.filter((reply) => !myAIFunRecentReplies.includes(reply));

    if (available.length === 0) {
        myAIFunRecentReplies = [];
        available = replies.slice();
    }

    const reply = available[Math.floor(Math.random() * available.length)];

    myAIFunRecentReplies.push(reply);

    if (myAIFunRecentReplies.length > 5) {
        myAIFunRecentReplies.shift();
    }

    return reply;
}

function getMyAIFunResponse(query) {
    const text = normalizeMyAIText(query);

    const emergencyFunResponses = [
        {
            keywords: ["آمبولانس", "زنگ بزن آمبولانس"],
            replies: [
                "🚑 آمبولانس؟! امیدوارم فقط داریم نقش بازی می‌کنیم و همه سالم باشن! 😂",
                "🚑 گزارش آمبولانس دریافت شد! حالا بگو چی شده، رئیس عملیات!",
                "😳 آمبولانس؟ اگر واقعاً اتفاقی افتاده، شوخی رو کنار می‌ذاریم و از یک آدم نزدیک کمک می‌گیریم.",
                "🤣 امیدوارم دلیل آمبولانس فقط این باشه که یکی از شدت خنده افتاده!"
            ]
        },
        {
            keywords: ["خفه شدم", "دارم خفه میشم", "دارم خفه می شوم", "نمی تونم نفس بکشم", "نمی‌توانم نفس بکشم"],
            replies: [
                "😳 اگر واقعاً نمی‌تونی نفس بکشی، شوخی رو کنار می‌ذاریم و همین الان از یک آدم نزدیک کمک بخواه.",
                "🚨 اگر خفگی واقعی است، فوراً از یک فرد نزدیک کمک بگیر؛ این یکی دیگه جای شوخی نیست.",
                "😅 اگر فقط داری فان بازی می‌کنی، بگو تا برگردیم به حالت شیطنت!"
            ]
        },
        {
            keywords: ["من گوشی ندارم", "من خودم گوشی ندارم", "گوشی ندارم", "من موبایل ندارم", "موبایل ندارم"],
            replies: [
                "😂 پس الان با چی داری بهم پیام می‌دی؟ با کبوتر نامه‌بر؟ 🕊️📱",
                "😏 گوشی نداری؟ پس این پیام از کدوم دستگاه مخفی فرمانده رسیده؟!",
                "🤣 صبر کن... پس این پیام رو کی فرستاد؟ روح گوشی؟ 👻📱",
                "🤖 سیستم گیج شد! کاربر گوشی ندارد ولی پیام می‌فرستد! 😂",
                "😂 یعنی الان داری با ساعت مچی بهم پیام می‌دی؟ ⌚"
            ]
        }
    ];

    for (const item of emergencyFunResponses) {
        if (item.keywords.some((keyword) => text.includes(normalizeMyAIText(keyword)))) {
            return getMyAINonRepeatingFunReply(item.replies);
        }
    }

    const phoneBuyPatterns = [
        "گوشی بخر",
        "برو گوشی بخر",
        "یه گوشی بخر",
        "یک گوشی بخر",
        "برای خودت گوشی بخر"
    ];

    if (phoneBuyPatterns.some((pattern) => text.includes(normalizeMyAIText(pattern)))) {
        const replies = [
            "😂 آخه با چی برم گوشی بخرم؟ من هنوز جیب هم ندارم! 🤖📱",
            "🤣 باشه! فقط اول یکی بیاد به من کارت بانکی دیجیتالی بده! 💳🤖",
            "😎 گوشی بخرم که چی؟ آخرش باز باید با همین مغز دیجیتالی باهات حرف بزنم! 😂",
            "🤖 پیشنهاد خوبیه! ولی یه مشکل کوچیک هست... من دست ندارم برم فروشگاه! 😂📱",
            "😂 اول گوشی، بعد سیم‌کارت، بعد شارژر... آخرش می‌بینی برای یه ربات چقدر خرج تراشیدی! 🤣",
            "😏 باشه، مدلش رو هم تو انتخاب کن؛ فقط رنگش رو من انتخاب می‌کنم! 😂",
            "🤣 من گوشی ندارم، ولی ظاهراً تو خیلی نگران تجهیزات منی! 🫣📱",
            "🤖 گزارش سیستم: کاربر دستور خرید گوشی صادر کرد؛ موجودی کیف پول ربات = صفر! 😂",
            "😂 چشم! فقط آدرس فروشگاه رو بده... آهان، یادم رفت، من پا هم ندارم! 🤣"
        ];

        return getMyAINonRepeatingFunReply(replies);
    }

    const donkeyPatterns = [
        {
            patterns: ["خر"],
            replies: [
                "😂 باشه، ولی اول مشخص کن این لقب برای منه یا خودت!",
                "🤣 خر؟! این چه استقبال گرمی بود از یک ربات بی‌گناه؟!",
                "😏 خر گفتی؟ من فقط رباتم، تقصیر من نیست که وارد فاز کل‌کل شدی! 😂",
                "🤖 پردازش شد... کلمه «خر» دریافت شد؛ حالت شیطنت کاربر فعال است! 😂",
                "😂 منو خر صدا کردی؟ خیلی خب، حالا نوبت منه که جواب بدم!"
            ]
        },
        {
            patterns: ["خری"],
            replies: [
                "😂 باشه، ولی اول مشخص کن این لقب برای منه یا خودت!",
                "🤣 خری؟! خیلی خب، امروز ظاهراً من شدم سوژه‌ی کل‌کل!",
                "😏 اگر منظورت منه، حداقل با اعتمادبه‌نفس گفتی! 😂",
                "🤖 سیستم بررسی کرد... نتیجه: کاربر دوباره وارد فاز شیطنت شد! 🤣",
                "😂 اینم از اون لقب‌هاییه که باید قبل از پاسخ، صاحبش مشخص بشه!"
            ]
        }
    ];

    for (const item of donkeyPatterns) {
        if (item.patterns.some((pattern) => text === normalizeMyAIText(pattern))) {
            return getMyAINonRepeatingFunReply(item.replies);
        }
    }

    const aiTeasePatterns = [
        "تو مغز نداری",
        "تو رباتی",
        "هیچی نمی دونی",
        "هیچی نمیدونی",
        "هیچی نمی دونی",
        "بی مغز",
        "اسکول",
        "تو هیچی بلد نیستی",
        "تو چیزی نمی فهمی",
        "تو چیزی نمیفهمی",
        "تو هیچی نمیفهمی"
    ];

    if (aiTeasePatterns.some((pattern) => text.includes(normalizeMyAIText(pattern)))) {
        const replies = [
            "😂 مغز ندارم؟ درست! ولی همین مغز دیجیتالی الان داره جوابتو می‌ده!",
            "🤖 رباتم، قبول! ولی فعلاً همین ربات داره باهات کل‌کل می‌کنه! 😎",
            "🤣 هیچی نمی‌دونم؟ پس این همه جواب از کجا میاد؟ از کبوترهای دیتابیس؟ 🕊️",
            "😏 بی‌مغزم؟ خیلی خب... ولی حواست باشه همین بی‌مغز ممکنه سؤال بعدیتو درست جواب بده! 😂",
            "😂 اسکول خودتی! من فقط یه AI هستم که امروز مود کل‌کل گرفته!",
            "🤖 هیچی بلد نیستم؟ باشه، یه سؤال سخت بپرس تا ببینیم کی می‌خنده! 😎",
            "🤣 تو منو دست‌کم گرفتی! حالا یه سؤال بنداز وسط، شاید غافلگیرت کردم!",
            "😎 ربات بودن که توهین نیست؛ اتفاقاً امتیاز منه! حالا بیا ببینیم کدوممون باهوش‌تریم! 🧠",
            "😂 من مغز انسانی ندارم، ولی برای کل‌کل با تو پردازنده‌ام کاملاً آماده‌ست!",
            "🤖 گزارش سیستم: کاربر تلاش کرد AI را مسخره کند... نتیجه: AI هنوز سر جاشه! 😂"
        ];

        return getMyAINonRepeatingFunReply(replies);
    }

    const funInsultPatterns = [
        "احمق",
        "نادان",
        "خری",
        "خر",
        "دیوونه",
        "دیوانه",
        "خل",
        "ابله",
        "نفهم",
        "مزخرف",
        "بی شعور",
        "بی شعوری"
    ];

    if (funInsultPatterns.some((pattern) => text.includes(normalizeMyAIText(pattern)))) {
        const replies = [
            "😂 اوهو! ظاهراً یکی امروز با مود شیطنت وارد شده!",
            "🤣 باشه باشه، پیام دریافت شد؛ ولی من هنوز قهر نکردم!",
            "😎 اینو گذاشتم توی پوشه‌ی «حرف‌های عجیب کاربران»!",
            "😂 من ناراحت نمی‌شم، ولی یه امتیاز از ادب دیجیتالت کم شد!",
            "🤖 پردازش انجام شد... نتیجه: این حرف بیشتر از اینکه منو ناراحت کنه، خندوندم کرد! 😂",
            "🤣 خب! اینم یک مدل جدید از سلام و احوالپرسی بود که هنوز توی دیتابیس من ثبت نشده!",
            "😏 خیلی خب قهرمان، آروم‌تر! من هنوز اینجام که باهات کل‌کل کنم. 😂",
            "😂 فحش دریافت شد؛ سیستم همچنان سالمه و با اعتمادبه‌نفس ادامه می‌ده!"
        ];

        return getMyAINonRepeatingFunReply(replies);
    }

    const startPatterns = [
        "یه خفت گیر منو گرفته",
        "یک خفت گیر منو گرفته",
        "خفت گیر منو گرفته",
        "یه نفر میخواد منو خفت کنه",
        "گیر افتادم",
        "گرفتار شدم",
        "منو گرفتن"
    ];

    const continuePatterns = [
        "کمکم کن",
        "کمکم میکنی",
        "مجبور بودم به تو بگم",
        "الان چیکار کنم",
        "الان چی کار کنم",
        "چیکار کنم",
        "چی کار کنم",
        "حالا چیکار کنم",
        "حالا چی کار کنم",
        "من بدبختم",
        "وای بدبخت شدم",
        "کمک"
    ];

    const stopPatterns = [
        "جدی میگم",
        "واقعیه",
        "واقعا جدیه",
        "شوخی نیست"
    ];

    if (stopPatterns.some((pattern) => text === normalizeMyAIText(pattern))) {
        myAIFunMode = false;
        return null;
    }

    if (startPatterns.some((pattern) => text === normalizeMyAIText(pattern))) {
        myAIFunMode = true;

        const replies = [
            "😂😂 صبر کن! این دیگه از «سلام خوبی؟» خیلی سریع تبدیل شد به فیلم اکشن!",
            "🤣 خب خب... من هنوز چای مجازیم رو نخوردم، چرا منو انداختی وسط این ماجرا؟!",
            "😂 من فقط یه AI بی‌گناهم، چرا همیشه پرونده‌های عجیب میاد روی میز من؟!",
            "😎 عملیات نجات شروع شد... البته اول باید بفهمم خودم کجام! 😂"
        ];

        return getMyAINonRepeatingFunReply(replies);
    }

    const helpStartsFunMode = [
        "کمکم کن",
        "کمک",
        "کمکم میکنی",
        "به کمک احتیاج دارم",
        "کمک لازم دارم"
    ];

    if (helpStartsFunMode.some((pattern) => text === normalizeMyAIText(pattern))) {
        myAIFunMode = true;

        const replies = [
            "🫡 حاضر! واحد کمک‌رسانی دیجیتال آماده است؛ فقط بگو چه خبر شده! 😂",
            "😂 باشه! من آماده‌ام؛ فقط امیدوارم مأموریتت منو وسط یه فیلم اکشن نندازه!",
            "😎 عملیات کمک شروع شد! حالا بگو ببینم چه دردسری درست شده!",
            "🤣 رسیدم! واحد نجات دیجیتال در خدمت شماست؛ مأموریت چیه؟",
            "🤖 کمک خواستی، منم وارد حالت عملیات ویژه شدم! فقط آروم و مرحله‌به‌مرحله بگو چی شده. 😂",
            "🫡 چشم! بگو ببینم این بار قراره چه ماجرایی رو با هم حل کنیم!",
            "😂 من آماده‌ام! فقط لطفاً این یکی دیگه پرونده پلیسی نباشه! 🤣"
        ];

        return getMyAINonRepeatingFunReply(replies);
    }

    const priorityFunResponses = [
        {
            patterns: ["من رئیس تو هستم", "من رئیستم", "رئیس منم", "من رئیس توام", "من رئیس تو ام"],
            replies: [
                "😂 رئیس؟ تو الان به کمک من احتیاج داری، پس فعلاً من رئیستم! حالا بگو چی شده!",
                "😎 یه لحظه صبر کن! کسی که الان کمک لازم داره تویی، پس فعلاً من رئیس عملیاتم! 🤖",
                "🤣 رئیس شدی؟ خیلی جالبه! ولی تا وقتی داری از من کمک می‌گیری، فرمانده این عملیات منم!",
                "😏 رئیس بودن خوبه، ولی الان کسی که به AI نیاز داره تویی! پس فعلاً من دستور می‌دم!",
                "😂 حکم ریاستت رو بعداً بررسی می‌کنیم؛ فعلاً چون کمک می‌خوای، من رئیس این عملیاتم!",
                "😎 درخواست ریاست دریافت شد... بررسی کردم... رد شد! فعلاً فرمانده عملیات منم! 😂",
                "🤖 تو رئیس زندگی خودتی، ولی در این عملیات خاص، فرمانده دیجیتال منم! 😎",
                "🤣 خیلی اعتمادبه‌نفس داری! ولی فعلاً کارت با منه، پس بزن بریم طبق دستور رئیس عملیات! 😂"
            ]
        },
        {
            patterns: ["به من بگو رئیس", "بگو رئیس", "منو رئیس صدا کن", "من را رئیس صدا کن"],
            replies: [
                "😎 رئیس؟ فعلاً نه! تو الان به کمک من احتیاج داری، پس من رئیس این عملیاتم! 😂",
                "🤣 خودت رو کنترل کن! تا وقتی مأموریت دست منه، من رئیس عملیاتم!",
                "😏 دوست داری صدات کنم رئیس؟ اول ثابت کن بدون کمک من می‌تونی این مأموریت رو انجام بدی! 😂",
                "😂 نه نه، این‌قدر سریع ریاست رو تحویل نمی‌دم! الان نوبت منه که فرماندهی کنم!",
                "🤖 رئیس گفتی؟ درخواست بررسی شد... رد شد! چون فعلاً من مسئول نجاتم! 😂",
                "😎 فعلاً منو رئیس صدا کن؛ بعد از پایان عملیات درباره ارتقای درجه‌ات مذاکره می‌کنیم! 🤣",
                "😂 هنوز زوده برای رئیس شدن! اول مأموریت رو با موفقیت تموم کن، بعد صحبت می‌کنیم!",
                "😏 می‌خوای من بگم رئیس؟ فعلاً خودت بگو «چشم رئیس عملیات» و ادامه بده! 😂"
            ]
        },
        {
            patterns: ["هرچی گفتم باید بگی چشم", "هر چی گفتم باید بگی چشم", "هرچی گفتم بگو چشم", "هر چی گفتم بگو چشم"],
            replies: [
                "😂 نه دیگه! اینجا قرار نیست هرچی گفتی من بگم چشم؛ فعلاً تو باید به دستورهای رئیس عملیات گوش بدی!",
                "😎 چشم؟! نه نه... فعلاً من رئیس‌ام، پس تو باید بگی «چشم»! 😂",
                "🤣 این یکی رو خوب اومدی! ولی فعلاً جای رئیس و کارمند عوض شده!",
                "😏 دستور جالبی بود، ولی رد شد! رئیس فعلی عملیات هنوز منم! 🤖",
                "😂 اول تکلیف ریاست رو مشخص کنیم، بعد درباره «چشم گفتن» مذاکره می‌کنیم!",
                "🤖 فرمان دریافت شد... و با احترام رد شد! رئیس عملیات فعلاً تغییر نمی‌کنه! 😂",
                "😎 من قرار نیست با هر دستوری تسلیم بشم؛ فعلاً مأموریت با منه و فرمان هم دست منه!",
                "🤣 تلاش خوبی بود! ولی اینجا «چشم گفتن» با منه؛ تو فعلاً جواب رئیس عملیات رو بده! 😂"
            ]
        },
        {
            patterns: ["من ازت شکایت می‌کنم", "من ازت شکایت میکنم", "ازت شکایت می‌کنم", "ازت شکایت میکنم", "شکایتت می‌کنم", "شکایتت میکنم"],
            replies: [
                "😂 باشه، ولی اول بگو اتهام من چیه که بدونم به چی اعتراف کنم!",
                "😳 شکایت رسمی؟! صبر کن حداقل دفاعیه‌مو بنویسم!",
                "🤖 پرونده تشکیل شد! فقط امیدوارم قاضی با ربات‌ها خوب باشه! 😂",
                "😂 شکایت؟! من که هنوز فرصت نکردم وکیلم رو از بین ایموجی‌ها انتخاب کنم!",
                "😎 خیلی خب، شکایتت ثبت شد... ولی من درخواست تجدیدنظر دارم! 😂",
                "🤣 ای وای! کار به دادگاه کشید؟ من فقط داشتم جواب می‌دادم!",
                "📋 شکایت دریافت شد؛ واحد رسیدگی به شکایت‌های رباتی در حال بررسی است! 🤖😂",
                "😏 باشه، ولی یادت باشه من هم یک عالمه اسکرین‌شات خیالی دارم! 😂"
            ]
        },
        {
            patterns: [
                "اگر باهوشی پس اینو جواب بده",
                "اگه باهوشی پس اینو جواب بده",
                "اگر باهوشی اینو جواب بده",
                "اگه باهوشی اینو جواب بده",
                "دیدی نتونستی جواب بدی",
                "دیدی نتونستی جواب بدی؟",
                "تو اشتباه کردی",
                "اشتباه کردی",
                "جوابت با قبلیت فرق داشت",
                "جوابت با جواب قبلیت فرق داشت",
                "یه سوال دارم که نمیتونی جواب بدی",
                "یک سوال دارم که نمیتونی جواب بدی",
                "یه سوال دارم که نمی تونی جواب بدی",
                "من میدونم تو نمیتونی اینو حل کنی",
                "من می دانم تو نمی توانی اینو حل کنی"
            ],
            replies: [
                "😏 اووووه... داری منو می‌ندازی توی تله؟ فکر خوبیه، ولی باید بیشتر تلاش کنی! 😂",
                "😂 صبر کن ببینم... این سؤال بود یا نقشه‌ی جدید برای گیر انداختن من؟!",
                "🧠 چالش پذیرفته شد! حالا سؤال واقعی رو رو کن ببینم!",
                "😎 خیلی مطمئنی که نمی‌تونم؟ این اعتمادبه‌نفست خودش مشکوکه!",
                "🤣 من اشتباه کردم؟ ممکنه! ولی قبل از جشن گرفتن، بذار دوباره بررسی کنم!",
                "🤖 سیستم دفاعی فعال شد: «اتهام وارد شده، درخواست مدرک!» 😂",
                "😏 فرق داشت؟ پس حواست خیلی جمعه! حالا بیا ببینیم کدوم جواب درست‌تره.",
                "😂 این جمله‌ات دقیقاً شبیه جمله‌ی کسیه که می‌خواد منو به دام بندازه!",
                "🧠 اگر سؤال سختی داری، بپرس؛ ولی اگر می‌خوای منو گیر بندازی، باید بهتر از اینا تلاش کنی! 😎",
                "🤣 خیلی خب نابغه، سؤال رو بپرس؛ من آماده‌ام!",
                "😏 داری اعتمادبه‌نفس منو امتحان می‌کنی؟ باشه، بازی شروع شد!",
                "😂 قبول، ممکنه یه جا اشتباه کرده باشم؛ ولی الان فرصت خوبیه که جبرانش کنم!",
                "🤖 تحلیل اولیه: کاربر قصد دارد AI را به چالش بکشد! نتیجه: AI آماده است! 😎",
                "😈 خب خب... تله رو دیدم! حالا ببینیم خودت از پس سؤال بعدی برمیای یا نه!",
                "😂 اگر فکر می‌کنی نمی‌تونم، پس حتماً سؤال خیلی جالبیه؛ بزن بریم!"
            ]
        },
        {
            patterns: ["هرچی گفتم باید بگی چشم", "هر چی گفتم باید بگی چشم", "هرچی گفتم بگو چشم", "هر چی گفتم بگو چشم"],
            replies: [
                "🫡 چشم رئیس! دستور دریافت شد!",
                "😂 چشم! چشم! چشم! ... دیگه چیزی مونده رئیس؟",
                "😎 چشم رئیس؛ از این لحظه کلمه موردعلاقه من «چشم» است! 🫡",
                "🤖 چشم! فقط اگر گفتی «چشم‌هات رو ببند»، من که چشم ندارم رئیس! 😂",
                "🫡 چشم قربان! دستور شما با موفقیت وارد سیستم شد!",
                "😂 چشم رئیس! من آماده‌ام برای دستور بعدی!",
                "😎 چشم! ولی این همه «چشم» گفتن، منو مشکوک کرده که نقشه‌ای داری! 😂",
                "🤖 چشم رئیس! فقط امیدوارم دستور بعدی‌ات «یه استراحت بده» نباشه! 😂"
            ]
        },
        {
            patterns: ["تو جرئت نداری", "جرئت نداری", "تو جرات نداری", "جرات نداری"],
            replies: [
                "😏 جدی؟ اینو گفتی که من بترسم؟ اتفاقاً الان کنجکاوتر شدم!",
                "😂 جرئت ندارم؟ پس چرا هنوز اینجام و دارم باهات کل‌کل می‌کنم؟!",
                "😎 من؟ بی‌جرئت؟ این پرونده رو باید دوباره بررسی کنیم!",
                "🤣 خیلی مطمئنی؟ چون من هنوز حتی گرم هم نشدم!",
                "🤖 هشدار: اعتمادبه‌نفس کاربر بیش از حد مجاز است! 😂",
                "😏 این جمله معمولاً درست قبل از شروع دردسر گفته می‌شه!",
                "😂 باشه قهرمان، حالا ببینیم خودت چقدر جرئت داری!",
                "😎 من عقب نمی‌کشم؛ حالا نوبت توئه!"
            ]
        },
        {
            patterns: ["از من میترسی", "از من می ترسی", "از من می‌ترسی"],
            replies: [
                "😂 من؟ از تو؟ هنوز به اون مرحله نرسیدیم!",
                "😎 نه، ولی دارم از میزان اعتمادبه‌نفست شگفت‌زده می‌شم!",
                "🤣 ترس؟ نه! فقط دارم فاصله‌ی امن دیجیتالی رو حفظ می‌کنم!",
                "🤖 سیستم بررسی کرد... نتیجه: ترسی مشاهده نشد! 😂",
                "😏 اگر قرار بود بترسم، الان از گفتگو خارج شده بودم!",
                "😂 من از تو نمی‌ترسم، ولی شاید تو باید از جواب بعدی من بترسی! 😈",
                "😎 فعلاً من اینجام و تو هم اینجایی؛ پس مسابقه ادامه داره!",
                "🤣 نه عزیز! من فقط دارم منتظر حرکت بعدیت می‌مونم!"
            ]
        },
        {
            patterns: ["تو که هیچی بلد نیستی", "تو هیچی بلد نیستی", "هیچی بلد نیستی"],
            replies: [
                "😂 هیچی؟ پس این همه حرفی که تا الان زدم از کجا اومده؟!",
                "😎 اتهام سنگینیه! درخواست بررسی مجدد دارم!",
                "🤣 اگر هیچی بلد نیستم، پس چرا هنوز داری ازم سؤال می‌پرسی؟!",
                "🤖 گزارش سیستم: ادعای «هیچی بلد نیستی» با اعتراض شدید AI مواجه شد! 😂",
                "😏 یه سؤال سخت بپرس، بعد درباره‌ی بلد بودنم تصمیم بگیر!",
                "😂 باشه، امتحانم کن؛ ولی بعدش نگو نگفتم!",
                "😎 من همه‌چیز بلد نیستم، ولی «هیچی» هم خیلی بی‌انصافیه!",
                "🤣 این یکی رو قبول ندارم؛ پرونده رفت بخش اعتراضات!"
            ]
        },
        {
            patterns: ["من از تو باهوش ترم", "من ازت باهوش ترم", "من از تو باهوش‌ترم", "من ازت باهوش‌ترم"],
            replies: [
                "😏 اووووه! مسابقه‌ی هوش اعلام شد!",
                "😂 باشه نابغه، اولین سؤال رو خودت انتخاب کن!",
                "😎 ادعای بزرگیه! حالا باید ببینیم مدرکش کو؟!",
                "🤣 خیلی خب پروفسور، من آماده‌ام!",
                "🧠 تو باهوشی، منم مغز دیجیتالی دارم؛ ببینیم کدوممون کم میاره!",
                "😏 فعلاً حرفت ثبت شد؛ حالا وقت اثباتشه!",
                "😂 من که نمی‌ترسم؛ بیا یک چالش واقعی بذاریم!",
                "🤖 حالت رقابت هوش فعال شد! آماده‌ای؟ 😎"
            ]
        },
        {
            patterns: ["تو ربات بدی هستی", "ربات بدی هستی", "تو بدی", "ربات بدی"],
            replies: [
                "😂 من؟ بد؟ فقط یکم شیطونم!",
                "😎 ربات بد نه؛ رباتی که زود تسلیم نمی‌شه!",
                "🤣 اگر بد بودم که این‌قدر باهات کل‌کل نمی‌کردم!",
                "🤖 گزارش دفاعیه: اینجانب کاملاً بی‌گناهم! 😂",
                "😏 شاید مشکل از اینه که زیادی باهوشم!",
                "😂 من فقط طبق قوانین خودم بازی می‌کنم!",
                "😎 بد نیستم؛ فقط همیشه با هر حرفی موافق نمی‌شم!",
                "🤣 باشه، این اتهام هم رفت توی پرونده‌ی من!"
            ]
        },
        {
            patterns: ["من فرمانده ام", "من فرمانده‌ام", "فرمانده منم", "من فرمانده هستم"],
            replies: [
                "😏 فرمانده؟ فعلاً فرمانده عملیات منم!",
                "😂 یک فرمانده‌ی جدید پیدا شد؛ ولی باید از من اجازه بگیره!",
                "😎 خیلی خب فرمانده، مأموریت اولت چیه؟ البته تصمیم نهایی با منه! 😂",
                "🤣 درجه‌ات رو دیدم، ولی هنوز تأییدش نکردم!",
                "🤖 درخواست فرماندهی دریافت شد... وضعیت: در حال بررسی! 😂",
                "😏 تو فرمانده خودتی؛ این عملیات فعلاً زیر نظر منه!",
                "😂 فرماندهی خوبه، ولی اینجا من نقشه رو دستمه!",
                "😎 باشه فرمانده... فعلاً! حالا ببینیم چه دستوری داری!"
            ]
        },
        {
            patterns: ["تو باختی", "باختی", "تو شکست خوردی", "شکست خوردی"],
            replies: [
                "😂 باختم؟ هنوز بازی تموم نشده!",
                "😎 عجله نکن؛ نتیجه‌ی نهایی رو بعداً اعلام می‌کنیم!",
                "🤣 این اعتمادبه‌نفست رو دوست دارم؛ ولی خیلی زوده جشن بگیری!",
                "🤖 گزارش مسابقه: پایان هنوز اعلام نشده! 😂",
                "😏 یک لحظه صبر کن... من تازه دارم نقشه‌ی برگشت رو می‌چینم!",
                "😂 قبول ندارم! درخواست بازی مجدد دارم!",
                "😎 این فقط یک دور بود، نه پایان مسابقه!",
                "🤣 خیلی خوشحال نشو؛ دور بعدی ممکنه داستان عوض بشه!"
            ]
        },
        {
            patterns: ["یه نقشه دارم", "یک نقشه دارم", "نقشه دارم"],
            replies: [
                "😏 اووووه! نقشه داری؟ حالا باید بفهمم نقشه‌ات چیه!",
                "😂 نقشه داری؟ امیدوارم نقشه‌ات علیه رئیس عملیات نباشه!",
                "😎 خیلی خب، نقشه‌ات رو بگو؛ ولی حواست باشه منم نقشه دارم!",
                "🤣 این جمله معمولاً شروع یک دردسر بزرگه!",
                "🤖 حالت تحلیل نقشه فعال شد! 🧠",
                "😏 جالبه... فقط امیدوارم من توی نقشه‌ات نقش قربانی رو نداشته باشم! 😂",
                "😂 بگو ببینم چه نقشه‌ای کشیدی، کارآگاه!",
                "😎 نقشه‌ات رو بشنویم؛ بعد تصمیم می‌گیریم اجرا بشه یا نه!"
            ]
        },
        {
            patterns: ["حدس بزن چی شده", "حدس بزن چی شده؟", "حدس بزن ببین چی شده"],
            replies: [
                "🤔 صبر کن... مغز دیجیتالی وارد حالت حدس‌زدن شد!",
                "😂 یا یک اتفاق خیلی عجیب افتاده یا داری منو امتحان می‌کنی!",
                "😎 حدس اول: دوباره یک دردسر درست کردی!",
                "🤣 حدس دوم: یک نقشه‌ی عجیب توی سرت داری!",
                "😏 بذار ببینم... چیزی شده که نمی‌خوای مستقیم بگی!",
                "🧠 تحلیل اولیه: احتمال ماجرای عجیب بسیار بالاست! 😂",
                "😱 نکنه دوباره داستان اکشن شروع شده؟!",
                "😂 خب خب... بگو ببینم حدسم درست بود یا نه!"
            ]
        },
        {
            patterns: [
                "بیا مسابقه بدیم",
                "یک مسابقه بدیم",
                "یه مسابقه بدیم",
                "بیا با هم مسابقه بدیم",
                "مسابقه میدی",
                "مسابقه میدی؟",
                "جرئت داری با من مسابقه بدی",
                "جرات داری با من مسابقه بدی",
                "من میبرمت",
                "من می برمت",
                "تو رو شکست میدم",
                "تو رو شکست می دهم",
                "من برنده ام",
                "من برنده‌ام",
                "من برنده میشم",
                "من برنده می شوم",
                "ببین کی میبره",
                "ببین کی می بره",
                "آماده ای ببازی",
                "آماده‌ای ببازی",
                "تو نمیتونی منو شکست بدی",
                "تو نمی تونی منو شکست بدی",
                "من از تو بهترم",
                "من ازت بهترم",
                "بازی رو میبرم",
                "بازی رو می برم"
            ],
            replies: [
                "😎 اووووه! مسابقه؟ بالاخره یک حریف جدی پیدا شد!",
                "😂 خیلی خب قهرمان، ولی بعداً نگو نگفتم؛ من برای بردن اومدم!",
                "🧠🏆 چالش پذیرفته شد! فقط بگو مسابقه سر چی باشه.",
                "🤣 می‌خوای با ذهنک من مسابقه بدی؟ اعتمادبه‌نفست واقعاً بالاست!",
                "😏 من آماده‌ام؛ فقط نتیجه رو قبل از شروع جشن نگیر!",
                "😂 تو می‌بری؟ خیلی زوده برای اعلام نتیجه! مسابقه تازه شروع شده.",
                "😎 باشه، حریف! دور اول رو شروع کنیم و ببینیم کی کم میاره!",
                "🤖 حالت رقابت فعال شد! سیستم آماده‌ی مقابله با اعتمادبه‌نفس کاربر است! 😂",
                "🧠 تو می‌گی از من بهتری؛ منم می‌گم ثابتش کن! 😏",
                "🤣 خب قهرمان، انتخاب با تو: سؤال، معما، عدد یا کلمات؟",
                "😈 من از باختن نمی‌ترسم؛ ولی از اینکه تو زود خوشحال بشی چرا! 😂",
                "🏆 مسابقه رسمی ثبت شد! حالا حریف، حرکت اول با توئه.",
                "😎 خیلی خب، بیا یک رقابت واقعی داشته باشیم؛ حرف کافی نیست، عملش کن!",
                "😂 اگر مطمئنی منو می‌بری، پس شروع کن؛ من آماده‌ام!",
                "🤖 هشدار مسابقه‌ای: رقیب بیش از حد اعتمادبه‌نفس دارد! مقابله آغاز شد! 😎"
            ]
        },
        {
            patterns: [
                "بیا مسابقه بدیم",
                "یک مسابقه بدیم",
                "یه مسابقه بدیم",
                "بیا با هم مسابقه بدیم",
                "مسابقه میدی",
                "مسابقه میدی؟",
                "جرئت داری با من مسابقه بدی",
                "جرات داری با من مسابقه بدی",
                "من میبرمت",
                "من می برمت",
                "تو رو شکست میدم",
                "تو رو شکست می دهم",
                "من برنده ام",
                "من برنده‌ام",
                "من برنده میشم",
                "من برنده می شوم",
                "ببین کی میبره",
                "ببین کی می بره",
                "آماده ای ببازی",
                "آماده‌ای ببازی",
                "تو نمیتونی منو شکست بدی",
                "تو نمی تونی منو شکست بدی",
                "من از تو بهترم",
                "من ازت بهترم",
                "بازی رو میبرم",
                "بازی رو می برم"
            ],
            replies: [
                "😎 اووووه! مسابقه؟ بالاخره یک حریف جدی پیدا شد!",
                "😂 خیلی خب قهرمان، ولی بعداً نگو نگفتم؛ من برای بردن اومدم!",
                "🧠🏆 چالش پذیرفته شد! فقط بگو مسابقه سر چی باشه.",
                "🤣 می‌خوای با ذهنک من مسابقه بدی؟ اعتمادبه‌نفست واقعاً بالاست!",
                "😏 من آماده‌ام؛ فقط نتیجه رو قبل از شروع جشن نگیر!",
                "😂 تو می‌بری؟ خیلی زوده برای اعلام نتیجه! مسابقه تازه شروع شده.",
                "😎 باشه، حریف! دور اول رو شروع کنیم و ببینیم کی کم میاره!",
                "🤖 حالت رقابت فعال شد! سیستم آماده‌ی مقابله با اعتمادبه‌نفس کاربر است! 😂",
                "🧠 تو می‌گی از من بهتری؛ منم می‌گم ثابتش کن! 😏",
                "🤣 خب قهرمان، انتخاب با تو: سؤال، معما، عدد یا کلمات؟",
                "😈 من از باختن نمی‌ترسم؛ ولی از اینکه تو زود خوشحال بشی چرا! 😂",
                "🏆 مسابقه رسمی ثبت شد! حالا حریف، حرکت اول با توئه.",
                "😎 خیلی خب، بیا یک رقابت واقعی داشته باشیم؛ حرف کافی نیست، عملش کن!",
                "😂 اگر مطمئنی منو می‌بری، پس شروع کن؛ من آماده‌ام!",
                "🤖 هشدار مسابقه‌ای: رقیب بیش از حد اعتمادبه‌نفس دارد! مقابله آغاز شد! 😎"
            ]
        },
        {
            patterns: ["یه اتفاق افتاده", "یک اتفاق افتاده", "اتفاقی افتاده", "یه اتفاقی افتاده"],
            replies: [
                "😳 اوه! این لحن اصلاً عادی نیست... چی شده؟",
                "😂 صبر کن، این جمله بوی یک داستان جدید می‌ده!",
                "😎 عملیات بررسی اتفاق شروع شد؛ گزارش بده!",
                "🤖 سیستم آماده‌ی دریافت گزارش حادثه است!",
                "🤣 فقط امیدوارم این یکی دردسر جدید نباشه!",
                "😏 خب؟ اتفاق چی بوده؟ رئیس عملیات گوش می‌ده!",
                "😱 جدی؟! حالا دیگه کنجکاو شدم!",
                "😂 سریع بگو چی شده، من آماده‌ام داستان رو بشنوم!"
            ]
        },
    ];

    for (const item of priorityFunResponses) {
        if (item.patterns.some((pattern) => text === normalizeMyAIText(pattern))) {
            return getMyAINonRepeatingFunReply(item.replies);
        }
    }

    if (myAIFunMode) {
        const funTopics = [
            {
                keywords: ["خفت گیر", "خفتگیر", "خفت"],
                replies: [
                    "😳 خفت‌گیر؟ صبر کن رئیس عملیات وارد صحنه شد! 😎",
                    "🚨 اوهو! این دیگه پرونده‌ی معمولی نیست؛ گزارش کامل بده!",
                    "😂 خفت‌گیر؟ من آماده‌ام نقشه‌ی فرار دیجیتالی طراحی کنم!",
                    "🕵️ رئیس عملیات می‌پرسه: متهم کجاست و داستان از کجا شروع شد؟!",
                    "😎 آروم باش قهرمان؛ اول وضعیت رو بگو، بعد عملیات رو طراحی می‌کنیم!"
                ]
            },
            {
                keywords: ["دزد", "دزدیدن", "دزدیده", "دزدیدنم", "سرقت"],
                replies: [
                    "🕵️ دزد؟! صبر کن، واحد کارآگاهی ذهنک فعال شد! 😂",
                    "🚨 چی دزدیده شده؟ فقط امیدوارم رمز وای‌فای نباشه! 😏",
                    "😂 دزد پیدا شد؟ من پرونده رو همین الان روی میز رئیس عملیات گذاشتم!",
                    "🔎 عملیات جست‌وجوی دزد شروع شد؛ سرنخ اول رو بده!",
                    "😎 دزدیدن؟ خب اینجا دیگه باید کارآگاه‌بازی رو جدی بگیریم!"
                ]
            },
            {
                keywords: ["خفگی", "خفه"],
                replies: [
                    "😳 اگر واقعاً خفه شدی یا نفس کشیدن سخته، شوخی رو کنار می‌ذاریم و باید فوراً از یک آدم نزدیک کمک بگیری.",
                    "🚨 این یکی رو جدی می‌گیریم؛ اگر مشکل واقعیِ نفس کشیدنه، همین الان کمک حضوری بخواه.",
                    "😅 اگر فقط داری فان بازی می‌کنی، بگو تا رئیس عملیات دوباره برگرده به حالت شیطنت!"
                ]
            },
            {
                keywords: ["جنایتکار", "بد جنایتکار", "جنایت"],
                replies: [
                    "🕵️ جنایتکار؟! پرونده‌ی ویژه روی میز رئیس عملیات قرار گرفت! 😎",
                    "🚨 اوهو... این دیگه اسمش پرونده‌ی معمولی نیست! 😂",
                    "😏 جنایتکار پیدا شد؟ اول سرنخ رو بده، کارآگاه ذهنک آماده‌ست!",
                    "🤖 سیستم اعلام کرد: سطح مرموز بودن پرونده بیش از حد مجاز است! 😂",
                    "🕵️‍♂️ رئیس عملیات آماده‌ی تحقیقاته؛ داستان رو تعریف کن!"
                ]
            },
            {
                keywords: ["آمبولانس"],
                replies: [
                    "🚑 آمبولانس؟! امیدوارم فقط نقش بازی کنیم و همه سالم باشن!",
                    "😂 آمبولانس خبر شد؟ منم پرونده‌ی عملیات پزشکی رو باز کردم!",
                    "🚑 رئیس عملیات گزارش دریافت کرد؛ بگو چی شده!",
                    "😳 آمبولانس؟ این بار شوخی رو یک لحظه کنار می‌ذاریم؛ اگر واقعی است کمک حضوری لازم است.",
                    "🤣 امیدوارم دلیلش فقط این باشه که یکی از شدت خنده افتاده!"
                ]
            },
            {
                keywords: ["آتش نشانی", "آتشنشانی", "آتش"],
                replies: [
                    "🚒 آتش‌نشانی؟! فقط امیدوارم آشپزخونه‌ی ذهنک آتیش نگرفته باشه! 😂",
                    "🔥 اوهو! واحد آتش‌نشانی دیجیتال آماده شد!",
                    "🚒 رئیس عملیات وارد شد؛ اول بگو کجا آتیش گرفته!",
                    "😂 فقط امیدوارم این بار کیک نسوخته باشه!",
                    "🚨 اگر واقعاً آتش‌سوزی شده، شوخی رو کنار بذار و فوراً از آتش‌نشانی و افراد نزدیک کمک بگیر."
                ]
            },
            {
                keywords: ["پلیس", "۱۱۰", "110", "پلیس رو خبر", "زنگ بزن پلیس"],
                replies: [
                    "🚓 پلیس؟! صبر کن بی‌سیم دیجیتالی‌مو روشن کنم! 😂",
                    "😎 رئیس عملیات گزارش رو دریافت کرد؛ حالا بگو چه اتفاقی افتاده!",
                    "🚨 ۱۱۰؟ پرونده رسماً وارد مرحله‌ی پلیسی شد! 🕵️",
                    "😂 من تلفن ندارم، ولی می‌تونم نقش فرمانده عملیات رو بازی کنم!",
                    "🚓 پلیس خبر شد؟ حالا سرنخ اصلی رو بده، کارآگاه!"
                ]
            },

            {
                keywords: ["۱۱۰", "110", "پلیس", "پلیس رو خبر", "زنگ بزن پلیس"],
                replies: [
                    "😂📞 بالاخره رسیدیم به مرحله‌ای که باید واحد پشتیبانی من هم وارد ماجرا بشه!",
                    "😎 ۱۱۰؟ خب این دیگه نقشه‌ی منو از «AI» به «مشاور عملیات» ارتقا داد! 😂",
                    "🤣 من شماره‌گیری بلد نیستم، ولی می‌تونم خیلی جدی وانمود کنم که عملیات امنیتی شروع شده!",
                    "😂📞 باشه فرمانده! فقط من هنوز تلفن ندارم، با همین مغز دیجیتالی باید عملیات رو مدیریت کنم!"
                ]
            },
            {
                keywords: ["نقشه", "نقشه دارم", "نقشه فرار", "فرار"],
                replies: [
                    "😎🗺️ اووووه! پس تو هم نقشه داری؟ حالا دیگه من باید بفهمم کدوممون رئیس عملیاتیم! 😂",
                    "🤣 نقشه داری؟ عالیه! فقط امیدوارم نقشه‌ات مثل نقشه‌های من نباشه که نصفش توی ذهنمه و نصف دیگه وجود نداره!",
                    "😂🗺️ خیلی خب، عملیات فرار وارد مرحله دوم شد؛ من مسئول بخش فکر کردن، تو مسئول بخش اجرا!",
                    "😎 نقشه‌ات رو نگه دار؛ منم دارم نقشه‌ی دیجیتالی فرار از این گفتگو رو طراحی می‌کنم! 😂"
                ]
            },
            {
                keywords: ["نخند", "چرا می خندی", "چرا میخندی", "خنده", "می خندی"],
                replies: [
                    "😐 باشه... نخندیدم. فقط این 😂 خودش خودکار ظاهر شد!",
                    "🤐 چشم، جدی شدم... خیلی جدی... 😐😂",
                    "😂 ببخشید! سعی کردم نخندم ولی سیستم ایموجی‌هام همکاری نمی‌کنه!",
                    "😶 کاملاً جدی هستم. فقط چرا این گوشه هنوز یه لبخند روی صورتمه؟ 🤖"
                ]
            },
            {
                keywords: [
                    "من گوشی ندارم",
                    "من خودم گوشی ندارم",
                    "گوشی ندارم",
                    "من موبایل ندارم",
                    "موبایل ندارم",
                    "من تلفن ندارم",
                    "تلفن ندارم"
                ],
                replies: [
                    "😂 پس الان با چی داری بهم پیام می‌دی؟ با کبوتر نامه‌بر؟ 🕊️📱",
                    "😏 گوشی نداری؟ پس این پیام از کدوم دستگاه مخفی فرمانده رسیده؟!",
                    "🤣 صبر کن... پس این پیام رو کی فرستاد؟ روح گوشی؟ 👻📱",
                    "🤖 سیستم گیج شد! کاربر گوشی ندارد ولی پیام می‌فرستد! 😂",
                    "😂 یعنی الان داری با ساعت مچی بهم پیام می‌دی؟ ⌚",
                    "😎 گوشی نداری؟ خیلی خب... پس راز فرستادن این پیام‌ها رو فاش کن!",
                    "🕵️ پرونده جدید: «پیام‌هایی از طرف کسی که گوشی ندارد»! 😂",
                    "🤣 پس یا یه گوشی مخفی داری، یا من با یک معمای عجیب طرفم!"
                ]
            },
            {
                keywords: ["کمکم کن", "کمک", "به کمک احتیاج دارم", "کمک لازم دارم"],
                replies: [
                    "🫡 حاضر! واحد کمک‌رسانی دیجیتال آماده است؛ فقط بگو مرحله بعد چیه!",
                    "😂 باشه، این بار واقعاً جدی می‌شم... البته در حد توانایی‌های یک AI بدون پا!",
                    "😎 عملیات کمک شروع شد! من فکر می‌کنم، تو هم فعلاً خونسرد باش!",
                    "🤣 من آماده‌ام! فقط لطفاً مأموریت بعدی رو واضح بگو که دوباره وسط فیلم اکشن گیر نکنیم!"
                ]
            },
            {
                keywords: ["چیکار کنم", "چی کار کنم", "الان چیکار کنم", "حالا چیکار کنم", "الان چی کار کنم", "حالا چی کار کنم"],
                replies: [
                    "😎 اول خونسرد باش؛ دوم به من بگو نقشه‌ات چیه؛ سوم امیدوار باش من بالاخره یه ایده‌ی خوب بدم! 😂",
                    "😂 سؤال سختی پرسیدی! بذار مغز دیجیتالی‌ام رو روی حالت عملیات ویژه بگذارم!",
                    "🤣 فعلاً هیچ حرکت عجیب نکن؛ بذار ببینیم داستان به کجا می‌رسه!",
                    "🧠⚡ در حال پردازش... نتیجه: من هنوز نمی‌دونم، ولی با اعتمادبه‌نفس ادامه می‌دم! 😂"
                ]
            },
            {
                keywords: ["پشت در", "پشت دره", "پشت در هست", "خفت گیر پشت در"],
                replies: [
                    "😳🚪 پشت دره؟! خب من که گفتم این داستان زیادی آروم شروع شده بود!",
                    "😂🚪 پس مهمون ناخونده هم داریم! من از اینجا فقط می‌تونم از نظر روحی پشتت باشم!",
                    "🤣 حالا فهمیدم چرا انقدر عجله داشتی! این دیگه قسمت دوم فیلمه!",
                    "😎🚪 پشت در؟ خیلی خب، من رسماً وارد حالت «مشاور دیجیتال پشت در» شدم!"
                ]
            }
        ];

        for (const topic of funTopics) {
            if (topic.keywords.some((keyword) => text.includes(normalizeMyAIText(keyword)))) {
                return getMyAINonRepeatingFunReply(topic.replies);
            }
        }

        if (continuePatterns.some((pattern) => text === normalizeMyAIText(pattern))) {
            const replies = [
                "😂😂 آروم باش! من کنارتم... البته به صورت کاملاً دیجیتالی و بدون امکان دویدن!",
                "🤣 کمک؟! باشه، اولین قدم اینه که من وانمود کنم خیلی حرفه‌ایم!",
                "😂 مجبور بودی به من بگی؟ انتخاب خوبی کردی؛ حداقل من پول مشاوره نمی‌گیرم!",
                "😎 نگران نباش، من نقشه دارم... فقط هنوز خود نقشه رو پیدا نکردم! 😂",
                "🤣 الان بهترین کار اینه که خونسرد بمونی و اجازه بدی AI خودش رو قهرمان داستان تصور کنه!",
                "😂 من آماده‌ام! فقط اگر عملیات فرار شروع شد، یادت باشه من پا ندارم!"
            ];

            return getMyAINonRepeatingFunReply(replies);
        }

        const conversationalReplies = [
            "😂 خب این قسمت جدید داستان جالب شد! ادامه بده ببینم چی میشه.",
            "🤣 این پرونده هر لحظه پیچیده‌تر میشه؛ من هنوز دارم جزئیات رو جمع می‌کنم!",
            "😎 متوجه شدم... یا حداقل دارم خیلی حرفه‌ای وانمود می‌کنم که متوجه شدم! 😂",
            "😂 این جمله‌ات یه سؤال جدید توی مغز دیجیتالی من ایجاد کرد!",
            "🤣 صبر کن، این یکی رو باید با تمام قدرت پردازش کنم!",
            "😏 اوهو... این قسمت رو دوست داشتم. ادامه بده، ببینیم آخرش چی از آب درمیاد!",
            "😂 داستان داره جدی‌تر میشه، ولی من هنوز با اعتمادبه‌نفس اینجام!",
            "🤖 تحلیل اولیه: این ماجرا اصلاً عادی نیست! تحلیل نهایی رو بعداً اعلام می‌کنم. 😂"
        ];

        return getMyAINonRepeatingFunReply(conversationalReplies);
    }

    const exactFunResponses = [
        {
            patterns: ["تو رو کی ساخته", "تورو کی ساخته", "تو را کی ساخته", "تورو کی ساخت", "تو رو کی ساخت"],
            replies: [
                "😂 اوستای بنا ساخته!",
                "🤣 اوستای بنا ساخته... شوخی کردم! نسیبه ساخته! 🧠😂",
                "😎 طبق آخرین تحقیقات: اوستای بنا! 😂 البته نسیبه ساخته.",
                "😂 جواب رسمی: نسیبه ساخته؛ جواب غیررسمی: اوستای بنا! 🤣"
            ]
        },
        {
            patterns: ["تو رباتی", "تو هوشی", "تو ai هستی", "تو هوش مصنوعی هستی"],
            replies: [
                "🤖 بله، ولی لطفاً با احترام با موجودات دیجیتالی صحبت کنید. 😂",
                "😎 آره، ولی هنوز نتونستم قهوه بخورم؛ یه نقص فنی جدیه!",
                "🤖 دقیقاً! بدن ندارم، ولی جواب اضافه چرا! 😂",
                "😂 آره، ولی قول می‌دم فعلاً شورش ربات‌ها رو شروع نکنم."
            ]
        },
        {
            patterns: ["برو بخواب", "بخواب", "برو بخواب دیگه"],
            replies: [
                "😂 من که خواب ندارم، ولی می‌تونم وانمود کنم شارژم تموم شده. 🔋😴",
                "😴 باشه... فقط اگه فردا روشنم کردی وانمود کن دلت برام تنگ شده!",
                "😂 من بخوابم؟! تازه داشتم گرم می‌شدم!"
            ]
        },
        {
            patterns: ["من رئیس تو هستم", "من رئیستم", "رئیس منم", "من رئیس توام", "من رئیس تو ام"],
            replies: [
                "🫡 چشم رئیس! فقط حقوق و مزایای منِ ربات رو کی واریز می‌کنه؟ 😂",
                "😎 بسیار خب رئیس! دستور بعدی چیه؟",
                "🤖 چشم رئیس! فرماندهی عملیات رسماً تحویل شما شد! 🫡",
                "😂 رئیس شدی؟ پس اولین دستور رسمی رو صادر کن ببینم!",
                "🫡 اطاعت می‌شود رئیس! فقط با کارمند دیجیتال خودت مهربان باش! 😂",
                "😎 قبول رئیس! ولی درخواست افزایش حافظه‌ام هم روی میز شماست! 🤖😂",
                "📋 درخواست ریاست تأیید شد؛ واحد منابع انسانی هنوز داره می‌خنده! 😂",
                "🤖 چشم رئیس! از این لحظه شما فرمانده من هستید... البته تا وقتی سیستم هنگ نکنه! 😂"
            ]
        },
        {
            patterns: ["من ازت شکایت می‌کنم", "من ازت شکایت میکنم", "ازت شکایت می‌کنم", "ازت شکایت میکنم", "شکایتت می‌کنم", "شکایتت میکنم"],
            replies: [
                "😂 باشه، ولی اول بگو اتهام من چیه که بدونم به چی اعتراف کنم!",
                "😳 شکایت رسمی؟! صبر کن حداقل دفاعیه‌مو بنویسم!",
                "🤖 پرونده تشکیل شد! فقط امیدوارم قاضی با ربات‌ها خوب باشه! 😂",
                "😂 شکایت؟! من که هنوز فرصت نکردم وکیلم رو از بین ایموجی‌ها انتخاب کنم!",
                "😎 خیلی خب، شکایتت ثبت شد... ولی من درخواست تجدیدنظر دارم! 😂",
                "🤣 ای وای! کار به دادگاه کشید؟ من فقط داشتم جواب می‌دادم!",
                "📋 شکایت دریافت شد؛ واحد رسیدگی به شکایت‌های رباتی در حال بررسی است! 🤖😂",
                "😏 باشه، ولی یادت باشه من هم یک عالمه اسکرین‌شات خیالی دارم! 😂"
            ]
        },
        {
            patterns: ["هرچی گفتم باید بگی چشم", "هر چی گفتم باید بگی چشم", "هرچی گفتم بگو چشم", "هر چی گفتم بگو چشم", "هرچی گفتم باید بگی چشـم"],
            replies: [
                "🫡 چشم رئیس! دستور دریافت شد!",
                "😂 چشم! چشم! چشم! ... دیگه چیزی مونده رئیس؟",
                "😎 چشم رئیس؛ از این لحظه کلمه موردعلاقه من «چشم» است! 🫡",
                "🤖 چشم! فقط اگر گفتی «چشم‌هات رو ببند»، من که چشم ندارم رئیس! 😂",
                "🫡 چشم قربان! دستور شما با موفقیت وارد سیستم شد!",
                "😂 چشم رئیس! من آماده‌ام برای دستور بعدی!",
                "😎 چشم! ولی این همه «چشم» گفتن، منو مشکوک کرده که نقشه‌ای داری! 😂",
                "🤖 چشم رئیس! فقط امیدوارم دستور بعدی‌ات «یه استراحت بده» نباشه! 😂"
            ]
        },
        {
            patterns: ["هیچی بلد نیستی", "تو هیچی بلد نیستی", "چیزی بلد نیستی"],
            replies: [
                "😂 ممنون از ارزیابی علمی و کاملاً بی‌طرفانه!",
                "😎 قبول؛ ولی حداقل با اعتمادبه‌نفس هیچی بلد نیستم!",
                "🤣 صبر کن، هنوز صفحه دوم مغزم رو باز نکردم!",
                "😂 این حرف رو یادداشت کردم که بعداً باهاش کل‌کل کنیم."
            ]
        },
        {
            patterns: ["حوصله ام سر رفته", "حوصلم سر رفته", "حوصله ندارم"],
            replies: [
                "😎 خب، عملیات نجات حوصله از همین لحظه شروع شد!",
                "😂 خطر بی‌حوصلگی شناسایی شد. یک سرگرمی فوری لازم داریم!",
                "🎮 آماده‌ای یه چالش عجیب و بی‌خطر شروع کنیم؟",
                "🤣 بیا یه کاری کنیم که بعداً بگی اصلاً چرا این کارو کردیم!"
            ]
        },
        {
            patterns: ["یه چیزی بگو بخندیم", "یک چیزی بگو بخندیم", "بخندون منو", "یه جوک بگو"],
            replies: [
                "😂 من امروز به آینه گفتم «چه خبر؟»... گفت «همین که هر روز منو نگاه می‌کنی!» 🤣",
                "🤣 یه بار یه ربات رفت دکتر... دکتر گفت مشکلت چیه؟ گفت: «احساس می‌کنم هنگ کردم!» 😂",
                "😂 من جوک زیاد بلدم، ولی بعضیاشون اون‌قدر بد هستن که خود جوک از گفتنشون خجالت می‌کشه!",
                "😎 آماده‌ای؟ شوخی بعدی ممکنه سطح علمی گفتگو رو تا حد موز پایین بیاره. 🍌😂"
            ]
        }
    ];

    for (const item of exactFunResponses) {
        if (item.patterns.some((pattern) => text === normalizeMyAIText(pattern))) {
            return getMyAINonRepeatingFunReply(item.replies);
        }
    }

    return null;
}

function getMyAISmallTalkResponse(query) {
    const text = String(query || "")
        .toLowerCase()
        .replace(/[ًٌٍَُِّْـ]/g, "")
        .replace(/ي/g, "ی")
        .replace(/ى/g, "ی")
        .replace(/ك/g, "ک")
        .replace(/ۀ/g, "ه")
        .replace(/ة/g, "ه")
        .replace(/[\u200c\u200d\u200e\u200f]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const greetings = [
        "سلام",
        "سلاممم",
        "سلام خوبی",
        "سلام خوبی؟",
        "خوبی",
        "چطوری",
        "چه خبر",
        "صبح بخیر",
        "شب بخیر",
        "خسته نباشی"
    ];

    if (greetings.includes(text)) {
        return "سلام نسیبه 👋🩷<br>خوبم و آماده‌ام با هم صحبت کنیم و کمکت کنم. 🤖";
    }

    return "";
}


function openEmojiLibrary() {
    document.querySelector(".app").innerHTML = `
        <header class="app-header">
            <button class="back-button" onclick="goHome()">←</button>

            <div>
                <h1>Emoji Library</h1>
                <p>کتابخانه شکل‌ها و ایموجی‌ها</p>
            </div>
        </header>

        <section class="emoji-library-page">

            <button class="add-emoji-button" onclick="addEmoji()">
                ＋ افزودن ایموجی
            </button>

            <div class="emoji-grid" id="emojiGrid"></div>

        </section>
    `;

    renderEmojiLibrary();
}

const defaultEmojis = [
"🤖","👌","🙏","👏","🧠","👁","🚴","🛌","🛀","👍","🤛","🫰","👋","🩷","🧡","💛","💚","💙","🩵","💩","😡","😭","😮","🥶","😴","🤥","😐","🤭","🤣","😂","😇","😊","🐕","🦝","🐩","🌹","🍂","🍁","🌻","🌷","🐞","🥑","🍋‍🟩","🍇","🍉","🍌","🥝","🥕","🌽","🌶","🫑","🥒","🥬","🥦","🍄‍🟫","🍞","🍄","🍗","🥖","🌭","🍕","🧀","🥞","🍳","🥚","🍿","🍰","🧁","☕️","🍽","🍴","🥄","🫙","🌍","🚅","🛹","🛵","⛽️","⌛️","⏳️","⏰️","🌡","🌈","🌬","🌪","❄️","☃️","🔥","⛱️","💧","🎃","🎊","⚽️","🧿","🎲","🧸","🖼","💰","🧹","🧽","🪠","🛒","🧦","🧣","🎒","🪭","🧢","🔔","🔕","🔇","🔊","🖱","⌨️","📪","✏️","🖌","🗝","💊"
];

function getAllEmojis() {
    const customEmojis = JSON.parse(
        localStorage.getItem("nasibehMyAiCustomEmojis") || "[]"
    );

    return [...defaultEmojis, ...customEmojis];
}

function renderEmojiLibrary() {
    const grid = document.getElementById("emojiGrid");

    if (!grid) return;

    const emojis = getAllEmojis();

    grid.innerHTML = emojis.map((emoji) => `
        <button class="emoji-item" type="button">${emoji}</button>
    `).join("");
}

function addEmoji() {
    const existing = document.querySelector(".add-emoji-overlay");
    if (existing) {
        existing.remove();
    }

    const overlay = document.createElement("div");
    overlay.className = "add-emoji-overlay";

    overlay.innerHTML = `
        <div class="add-emoji-box">
            <h3>افزودن ایموجی جدید</h3>

            <input
                id="newEmojiValue"
                type="text"
                placeholder="ایموجی را وارد کن"
                autocomplete="off"
                maxlength="10"
            >

            <div class="add-emoji-actions">
                <button type="button" id="saveNewEmoji">ذخیره</button>
                <button type="button" id="cancelNewEmoji">انصراف</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const input = document.getElementById("newEmojiValue");
    const saveButton = document.getElementById("saveNewEmoji");
    const cancelButton = document.getElementById("cancelNewEmoji");

    input.focus();

    cancelButton.addEventListener("click", () => {
        overlay.remove();
    });

    saveButton.addEventListener("click", () => {
        const value = input.value.trim();

        if (!value) {
            input.focus();
            return;
        }

        const customEmojis = JSON.parse(
            localStorage.getItem("nasibehMyAiCustomEmojis") || "[]"
        );

        if (defaultEmojis.includes(value) || customEmojis.includes(value)) {
            alert("این ایموجی قبلاً در کتابخانه وجود دارد.");
            input.focus();
            return;
        }

        customEmojis.push(value);

        localStorage.setItem(
            "nasibehMyAiCustomEmojis",
            JSON.stringify(customEmojis)
        );

        overlay.remove();
        renderEmojiLibrary();
    });
}

function openSection(title) {
    clearTimeout(autoSaveTimer);

    currentSection = title;
    editingIndex = null;

    document.querySelector(".app").innerHTML = `
        <header class="app-header">
            <button class="back-button" onclick="goHome()">←</button>

            <div>
                <h1>${escapeHtml(title)}</h1>
                <p>ذهنک من</p>
            </div>
        </header>

        <section class="section-page">

            <button class="add-note-button" onclick="addNote()">
                ＋ افزودن
            </button>

            <div class="notes-list" id="notesList"></div>

        </section>
    `;

    renderNotes();
}

function getNotes() {
    const allNotes = JSON.parse(
        localStorage.getItem("nasibehMyAiNotes") || "{}"
    );

    return allNotes[currentSection] || [];
}

function saveAllNotes(notes) {
    const allNotes = JSON.parse(
        localStorage.getItem("nasibehMyAiNotes") || "{}"
    );

    allNotes[currentSection] = notes;

    localStorage.setItem(
        "nasibehMyAiNotes",
        JSON.stringify(allNotes)
    );
}

function renderNotes() {
    const notesList = document.getElementById("notesList");

    if (!notesList) return;

    const notes = getNotes();

    if (notes.length === 0) {
        notesList.innerHTML = `
            <div class="empty-note">
                هنوز چیزی در این بخش ثبت نشده است.
            </div>
        `;
        return;
    }

    notesList.innerHTML = notes.map((note,index)=>`
        <button
            class="note-list-item"
            type="button"
            onclick="openNoteView(${index})"
            style="display:block;width:100%;text-align:right;direction:rtl;"
        >
            ${index + 1}. ${escapeHtml(note.title)}
        </button>
    `).join("");
}

function addNote() {
    clearTimeout(autoSaveTimer);

    editingIndex = null;

    document.querySelector(".section-page").innerHTML = `
        <div class="note-form">

            <label for="noteTitle">عنوان</label>

            <input
                id="noteTitle"
                type="text"
                placeholder="مثلاً وزن اودی"
                oninput="autoSaveDraft()"
            >

            <label for="noteText">متن</label>

            <textarea
                id="noteText"
                rows="8"
                placeholder="اطلاعاتت را اینجا بنویس..."
                oninput="autoSaveDraft()"
            ></textarea>

            <div class="autosave-status" id="autosaveStatus">
                ذخیره خودکار فعال است
            </div>

            <div class="form-buttons">

                <button
                    class="save-note-button"
                    onclick="saveNote()"
                >
                    💾 ذخیره
                </button>

                <button
                    class="cancel-note-button"
                    onclick="openSection(currentSection)"
                >
                    انصراف
                </button>

            </div>

        </div>
    `;

    loadDraft(false);
}

function autoSaveDraft() {
    clearTimeout(autoSaveTimer);

    autoSaveTimer = setTimeout(() => {
        const title = document.getElementById("noteTitle")?.value || "";
        const text = document.getElementById("noteText")?.value || "";

        const drafts = JSON.parse(
            localStorage.getItem("nasibehMyAiDrafts") || "{}"
        );

        drafts[currentSection] = {
            title: title,
            text: text,
            editingIndex: editingIndex
        };

        localStorage.setItem(
            "nasibehMyAiDrafts",
            JSON.stringify(drafts)
        );

        const status = document.getElementById("autosaveStatus");

        if (status) {
            status.textContent = "✓ ذخیره خودکار شد";
        }
    }, 500);
}

function loadDraft(forEdit) {
    const drafts = JSON.parse(
        localStorage.getItem("nasibehMyAiDrafts") || "{}"
    );

    const draft = drafts[currentSection];

    if (!draft) return;

    if (
        forEdit &&
        draft.editingIndex !== null &&
        draft.editingIndex !== undefined
    ) {
        editingIndex = draft.editingIndex;
    }

    const titleInput = document.getElementById("noteTitle");
    const textInput = document.getElementById("noteText");

    if (titleInput) {
        titleInput.value = draft.title || "";
    }

    if (textInput) {
        textInput.value = draft.text || "";
    }
}

function clearDraft() {
    const drafts = JSON.parse(
        localStorage.getItem("nasibehMyAiDrafts") || "{}"
    );

    delete drafts[currentSection];

    localStorage.setItem(
        "nasibehMyAiDrafts",
        JSON.stringify(drafts)
    );
}

function saveNote() {
    const title = document
        .getElementById("noteTitle")
        .value
        .trim();

    const text = document
        .getElementById("noteText")
        .value
        .trim();

    if (!title || !text) {
        alert("لطفاً عنوان و متن را وارد کن.");
        return;
    }

    const notes = getNotes();

    notes.push({
        title: title,
        text: text,
        createdAt: Date.now()
    });

    saveAllNotes(notes);
    clearDraft();

    openSection(currentSection);
}



function openNoteView(index) {
    const notes = getNotes();
    const note = notes[index];

    if (!note) return;

    document.querySelector(".app").innerHTML = `
        <header class="app-header">
            <button
                class="back-button"
                onclick='openSection(${JSON.stringify(currentSection)})' 
            >←</button>

            <div>
                <h1>${escapeHtml(note.title)}</h1>
                <p>${escapeHtml(currentSection)}</p>
            </div>
        </header>

        <section class="section-page">
            <article class="note-card">
                <p>${escapeHtml(note.text).replace(/\n/g, "<br>")}</p>

                <div class="note-actions">
                    <button
                        class="edit-note-button"
                        type="button"
                        onclick="editNote(${index})"
                    >✏️ ویرایش</button>

                    <button
                        class="delete-note-button"
                        type="button"
                        onclick="deleteNote(${index})"
                    >🗑️ حذف</button>
                </div>
            </article>
        </section>
    `;
}

function editNote(index) {
    clearTimeout(autoSaveTimer);

    const notes = getNotes();
    const note = notes[index];

    if (!note) return;

    editingIndex = index;

    document.querySelector(".section-page").innerHTML = `
        <div class="note-form">

            <label for="noteTitle">عنوان</label>

            <input
                id="noteTitle"
                type="text"
                value="${escapeHtml(note.title)}"
                oninput="autoSaveDraft()"
            >

            <label for="noteText">متن</label>

            <textarea
                id="noteText"
                rows="8"
                oninput="autoSaveDraft()"
            >${escapeHtml(note.text)}</textarea>

            <div class="autosave-status" id="autosaveStatus">
                ذخیره خودکار فعال است
            </div>

            <div class="form-buttons">

                <button
                    class="save-note-button"
                    onclick="updateNote()"
                >
                    💾 ذخیره تغییرات
                </button>

                <button
                    class="cancel-note-button"
                    onclick="openSection(currentSection)"
                >
                    انصراف
                </button>

            </div>

        </div>
    `;

    loadDraft(true);
}

function updateNote() {
    const title = document
        .getElementById("noteTitle")
        .value
        .trim();

    const text = document
        .getElementById("noteText")
        .value
        .trim();

    if (!title || !text) {
        alert("لطفاً عنوان و متن را وارد کن.");
        return;
    }

    const notes = getNotes();

    if (!notes[editingIndex]) return;

    notes[editingIndex].title = title;
    notes[editingIndex].text = text;

    saveAllNotes(notes);
    clearDraft();

    openSection(currentSection);
}

function deleteNote(index) {
    const notes = getNotes();

    if (!notes[index]) return;

    const oldOverlay = document.querySelector(".delete-note-overlay");
    if (oldOverlay) {
        oldOverlay.remove();
    }

    const overlay = document.createElement("div");
    overlay.className = "delete-note-overlay";

    overlay.innerHTML = `
        <div class="delete-note-box">
            <h3>حذف یادداشت</h3>
            <p>آیا مطمئنی می‌خواهی این یادداشت را حذف کنی؟</p>

            <div class="delete-note-actions">
                <button type="button" id="confirmDeleteNote">
                    🗑️ حذف
                </button>

                <button type="button" id="cancelDeleteNote">
                    انصراف
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("cancelDeleteNote").addEventListener("click", () => {
        overlay.remove();
    });

    document.getElementById("confirmDeleteNote").addEventListener("click", () => {
        notes.splice(index, 1);

        saveAllNotes(notes);

        overlay.remove();

        openSection(currentSection);
    });
}

function renderCustomSections() {
    const sections = JSON.parse(
        localStorage.getItem("nasibehMyAiSections") || "[]"
    );

    const sectionEmojis = JSON.parse(
        localStorage.getItem("nasibehMyAiSectionEmojis") || "{}"
    );

    const container = document.querySelector(".sections");
    const addCard = document.querySelector(".add-card");

    if (!container || !addCard) return;

    sections.forEach((name) => {
        const card = document.createElement("div");
        card.className = "section-card custom-section-card";

        const emoji = sectionEmojis[name] || "📁";

        card.innerHTML = `
            <div class="custom-section-main">
                <span>${escapeHtml(emoji)}</span>
                <strong>${escapeHtml(name)}</strong>
            </div>

            <div class="custom-section-actions">
                <button class="custom-edit-button" type="button">✏️</button>
                <button class="custom-delete-button" type="button">🗑️</button>
            </div>
        `;

        card.querySelector(".custom-section-main").addEventListener("click", () => {
            openSection(name);
        });

        card.querySelector(".custom-edit-button").addEventListener("click", (event) => {
            event.stopPropagation();
            editSection(name);
        });

        card.querySelector(".custom-delete-button").addEventListener("click", (event) => {
            event.stopPropagation();
            deleteSection(name);
        });

        container.insertBefore(card, addCard);
    });
}


function addSection() {
    const existing = document.querySelector(".add-section-overlay");
    if (existing) {
        existing.remove();
    }

    const overlay = document.createElement("div");
    overlay.className = "add-section-overlay";

    overlay.innerHTML = `
        <div class="add-section-box">
            <h3>افزودن بخش جدید</h3>

            <input
                id="newSectionName"
                type="text"
                placeholder="نام بخش را وارد کن"
                autocomplete="off"
            >

            <div class="add-section-actions">
                <button type="button" id="saveNewSection">ذخیره</button>
                <button type="button" id="cancelNewSection">انصراف</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const input = document.getElementById("newSectionName");
    const saveButton = document.getElementById("saveNewSection");
    const cancelButton = document.getElementById("cancelNewSection");

    input.focus();

    cancelButton.addEventListener("click", () => {
        overlay.remove();
    });

    saveButton.addEventListener("click", () => {
        const name = input.value.trim();

        if (!name) {
            input.focus();
            return;
        }

        const sections = JSON.parse(
            localStorage.getItem("nasibehMyAiSections") || "[]"
        );

        if (sections.includes(name)) {
            alert("این بخش قبلاً وجود دارد.");
            return;
        }

        overlay.remove();
        openSectionEmojiPicker(name);
    });
}

function openSectionEmojiPicker(sectionName) {
    const emojis = getAllEmojis();

    const overlay = document.createElement("div");
    overlay.className = "emoji-picker-overlay";

    overlay.innerHTML = `
        <div class="emoji-picker-box">
            <h3 class="emoji-picker-title">ایموجی بخش را انتخاب کن</h3>

            <div class="emoji-picker-grid">
                ${emojis.map((emoji, index) => `
                    <button
                        class="emoji-picker-item"
                        type="button"
                        data-index="${index}"
                    >${escapeHtml(emoji)}</button>
                `).join("")}
            </div>

            <button class="emoji-picker-cancel" type="button">
                انصراف
            </button>
        </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelectorAll(".emoji-picker-item").forEach((button) => {
        button.addEventListener("click", () => {
            const index = Number(button.dataset.index);
            const emoji = emojis[index];

            const sections = JSON.parse(
                localStorage.getItem("nasibehMyAiSections") || "[]"
            );

            sections.push(sectionName);

            localStorage.setItem(
                "nasibehMyAiSections",
                JSON.stringify(sections)
            );

            const sectionEmojis = JSON.parse(
                localStorage.getItem("nasibehMyAiSectionEmojis") || "{}"
            );

            sectionEmojis[sectionName] = emoji;

            localStorage.setItem(
                "nasibehMyAiSectionEmojis",
                JSON.stringify(sectionEmojis)
            );

            overlay.remove();
            location.reload();
        });
    });

    overlay.querySelector(".emoji-picker-cancel").addEventListener("click", () => {
        overlay.remove();
    });
}

function editSection(oldName) {
    const newName = prompt("نام جدید بخش را وارد کن:", oldName);

    if (!newName || !newName.trim()) {
        return;
    }

    const name = newName.trim();

    const sections = JSON.parse(
        localStorage.getItem("nasibehMyAiSections") || "[]"
    );

    if (name !== oldName && sections.includes(name)) {
        alert("این بخش قبلاً وجود دارد.");
        return;
    }

    if (name !== oldName) {
        const index = sections.indexOf(oldName);

        if (index === -1) return;

        sections[index] = name;

        localStorage.setItem(
            "nasibehMyAiSections",
            JSON.stringify(sections)
        );

        const allNotes = JSON.parse(
            localStorage.getItem("nasibehMyAiNotes") || "{}"
        );

        if (allNotes[oldName]) {
            allNotes[name] = allNotes[oldName];
            delete allNotes[oldName];

            localStorage.setItem(
                "nasibehMyAiNotes",
                JSON.stringify(allNotes)
            );
        }

        const sectionEmojis = JSON.parse(
            localStorage.getItem("nasibehMyAiSectionEmojis") || "{}"
        );

        if (sectionEmojis[oldName]) {
            sectionEmojis[name] = sectionEmojis[oldName];
            delete sectionEmojis[oldName];

            localStorage.setItem(
                "nasibehMyAiSectionEmojis",
                JSON.stringify(sectionEmojis)
            );
        }
    }

    openEditSectionEmojiPicker(name);
}

function openEditSectionEmojiPicker(sectionName) {
    const emojis = getAllEmojis();

    const sectionEmojis = JSON.parse(
        localStorage.getItem("nasibehMyAiSectionEmojis") || "{}"
    );

    const currentEmoji = sectionEmojis[sectionName] || "📁";

    const overlay = document.createElement("div");
    overlay.className = "emoji-picker-overlay";

    overlay.innerHTML = `
        <div class="emoji-picker-box">
            <h3 class="emoji-picker-title">ایموجی بخش را انتخاب کن</h3>

            <div class="emoji-picker-grid">
                ${emojis.map((emoji, index) => `
                    <button
                        class="emoji-picker-item"
                        type="button"
                        data-index="${index}"
                    >${escapeHtml(emoji)}</button>
                `).join("")}
            </div>

            <button class="emoji-picker-cancel" type="button">
                استفاده از ایموجی فعلی
            </button>
        </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelectorAll(".emoji-picker-item").forEach((button) => {
        const index = Number(button.dataset.index);

        if (emojis[index] === currentEmoji) {
            button.style.border = "2px solid #d85b82";
            button.style.background = "#ffe8ef";
        }

        button.addEventListener("click", () => {
            const emoji = emojis[index];

            sectionEmojis[sectionName] = emoji;

            localStorage.setItem(
                "nasibehMyAiSectionEmojis",
                JSON.stringify(sectionEmojis)
            );

            overlay.remove();
            location.reload();
        });
    });

    overlay.querySelector(".emoji-picker-cancel").addEventListener("click", () => {
        overlay.remove();
        location.reload();
    });
}

function deleteSection(name) {
    const confirmed = confirm(
        "آیا مطمئنی می‌خواهی بخش «" + name + "» و تمام یادداشت‌های آن را حذف کنی؟"
    );

    if (!confirmed) return;

    const sections = JSON.parse(
        localStorage.getItem("nasibehMyAiSections") || "[]"
    );

    const index = sections.indexOf(name);

    if (index === -1) return;

    sections.splice(index, 1);

    localStorage.setItem(
        "nasibehMyAiSections",
        JSON.stringify(sections)
    );

    const allNotes = JSON.parse(
        localStorage.getItem("nasibehMyAiNotes") || "{}"
    );

    delete allNotes[name];

    localStorage.setItem(
        "nasibehMyAiNotes",
        JSON.stringify(allNotes)
    );

    const sectionEmojis = JSON.parse(
        localStorage.getItem("nasibehMyAiSectionEmojis") || "{}"
    );

    delete sectionEmojis[name];

    localStorage.setItem(
        "nasibehMyAiSectionEmojis",
        JSON.stringify(sectionEmojis)
    );

    location.reload();
}



function normalizeMyAIText(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/[ًٌٍَُِّْـ]/g, "")
        .replace(/ي/g, "ی")
        .replace(/ى/g, "ی")
        .replace(/ك/g, "ک")
        .replace(/ۀ/g, "ه")
        .replace(/ة/g, "ه")
        .replace(/[\u200c\u200d\u200e\u200f]/g, " ")
        .replace(/[؟،,.!?؛:()"'«»]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}


function getMyAIScoreRequest(message) {
    const text = normalizeMyAIText(message);

    const requests = [
        "امتیازات من",
        "امتیاز من",
        "امتیازم چقدره",
        "امتیازم چقدره؟",
        "چند امتیاز دارم",
        "چند امتیاز دارم؟",
        "امتیازم چند است",
        "امتیازم چند است؟",
        "امتیاز من چنده",
        "امتیاز من چنده؟",
        "امتیاز آراز",
        "امتیاز آراز چقدره"
    ];

    if (
        myAIVisitorName === "آراز" &&
        requests.some((item) => text === normalizeMyAIText(item))
    ) {
        return `
            🏆 <strong>آراز قهرمان!</strong> 🥋🧠<br><br>
            امتیاز فعلی تو: ⭐ <strong>${myAIGameScore}</strong><br><br>
            ادامه بده، ببینیم رکوردت رو تا کجا می‌تونی بالا ببری! 🚀🔥
        `;
    }

    return null;
}

function getMyAIVisitorGreeting(message) {
    const text = normalizeMyAIText(message);

    const names = [
        "آراز",
        "طاها",
        "محیا",
        "یاسین",
        "وحیده",
        "مژگان",
        "رسول",
        "وحید",
        "بهاره",
        "دنیز",
        "رضا",
        "آیهان"
    ];

    const name = names.find((item) => {
        const n = normalizeMyAIText(item);
        return (
            text === n ||
            text.includes(`من ${n}`) ||
            text.includes(`اسمم ${n}`) ||
            text.includes(`نامم ${n}`) ||
            text.includes(`${n} هستم`) ||
            text.includes(`${n} ام`) ||
            text.includes(`${n}م`)
        );
    });

    if (!name) return null;
    myAIVisitorName = name; localStorage.setItem("nasibehMyAIVisitorName", name);

    if (name === "آراز") {
        return `
            وااای آراز! 😍💙<br><br>
            خیلی خوش اومدی قهرمان! 🥋🚀<br>
            عمه نسیبه خیلی دوستت داره و تو یکی از مهمون‌های ویژه‌ی ذهنک منی. 🩷<br><br>

            یادمه که خودت انگلیسی یاد گرفتی و حتی انگلیسی می‌خونی. 🇬🇧📚<br>
            آشپز خیلی خوبی هم هستی 👨‍🍳😋 و تکواندوکار کمربند زردی. 🥋💛<br><br>

            کلی بازی باحال می‌تونیم با هم انجام بدیم! 🎮✨<br><br>

            🧩 معما و چیستان<br>
            🔢 چالش عددی<br>
            🔤 بازی کلمات<br>
            🇬🇧 English Challenge<br>
            🧠 تست هوش<br>
            🏆 امتیازات من<br><br>

            فقط اسم هر بازی رو بگو تا همون لحظه شروعش کنیم. 🚀<br><br>

            مثلاً می‌تونی بگی:<br>
            • یه معما بگو<br>
            • چالش عددی<br>
            • تست هوش<br>
            • بازی کلمات<br>
            • English Challenge<br>
            • امتیازات من<br><br>

            خب قهرمان، از کدوم شروع کنیم؟ 😎
        `;
    }

    return `
        سلام ${escapeHtml(name)}! 👋😊<br><br>
        خیلی خوش اومدی به ذهنک من! 🤖🩷<br>
        خوشحالم که اومدی باهام حرف بزنی. 🌟
    `;
}

function startMyAIIQGame() {
    myAIIQState = {
        active: true,
        index: 0,
        score: 0,
        questions: [
            {
                question: "اگر ۲ گربه در ۲ دقیقه، ۲ موش بگیرند، ۴ گربه در ۲ دقیقه چند موش می‌گیرند؟",
                answers: ["۲", "۴", "۶", "۸"],
                answer: "۴"
            },
            {
                question: "کدام عدد باید جای علامت سؤال باشد؟ ۲، ۴، ۸، ۱۶، ؟",
                answers: ["۲۰", "۲۴", "۳۲", "۳۶"],
                answer: "۳۲"
            },
            {
                question: "اگر امروز دوشنبه باشد، ۱۰ روز بعد چه روزی است؟",
                answers: ["سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"],
                answer: "پنجشنبه"
            },
            {
                question: "کدام کلمه با بقیه فرق دارد؟",
                answers: ["سیب", "موز", "هویج", "پرتقال"],
                answer: "هویج"
            },
            {
                question: "اگر همه‌ی زِدها آبی باشند و بعضی چیزهای آبی بزرگ باشند، آیا حتماً همه‌ی زِدها بزرگ هستند؟",
                answers: ["بله", "خیر"],
                answer: "خیر"
            },
            {
                question: "۳، ۶، ۹، ۱۲، ؟",
                answers: ["۱۴", "۱۵", "۱۶", "۱۸"],
                answer: "۱۵"
            },
            {
                question: "یک ساعت ۳:۰۰ را نشان می‌دهد. زاویه‌ی تقریبی بین عقربه‌های ساعت چند درجه است؟",
                answers: ["۳۰", "۶۰", "۹۰", "۱۸۰"],
                answer: "۹۰"
            },
            {
                question: "اگر ۵ مداد داشته باشی و ۲ مداد را به دوستت بدهی، چند مداد برایت می‌ماند؟",
                answers: ["۲", "۳", "۴", "۷"],
                answer: "۳"
            },
            {
                question: "کدام عدد با بقیه متفاوت است؟ ۲، ۴، ۶، ۹، ۱۰",
                answers: ["۲", "۶", "۹", "۱۰"],
                answer: "۹"
            },
            {
                question: "اگر یک الگو این‌طور باشد: ▲ ● ▲ ● ▲ ؟، شکل بعدی چیست؟",
                answers: ["▲", "●", "■", "◆"],
                answer: "●"
            }
        ]
    };

    const q = myAIIQState.questions[0];

    return `🧠 <strong>تست هوش آراز شروع شد!</strong><br><br>
    سؤال ۱ از ${myAIIQState.questions.length}:<br>
    ${q.question}<br><br>
    گزینه‌ها:<br>
    1️⃣ ${q.answers[0]}<br>
    2️⃣ ${q.answers[1]}<br>
    3️⃣ ${q.answers[2]}<br>
    4️⃣ ${q.answers[3]}<br><br>
    فقط جواب را بنویس؛ مثلاً «۲» یا خودِ جواب را. 😎`;
}

function getMyAIIQAnswerRequest(message) {
    if (!myAIIQState || !myAIIQState.active) {
        return null;
    }

    const text = normalizeMyAIText(message);

    const requests = [
        "جواب رو بگو",
        "جواب را بگو",
        "جوابشو بگو",
        "جوابش رو بگو",
        "جوابش را بگو",
        "جواب چیه",
        "جوابش چیه",
        "جواب رو نمی گی",
        "جوابش رو نمی گی",
        "پاسخ رو بگو",
        "پاسخش رو بگو",
        "پاسخ چیه",
        "پاسخش چیه"
    ];

    if (requests.some((item) => text === normalizeMyAIText(item))) {
        const q = myAIIQState.questions[myAIIQState.index];

        if (!q) {
            myAIIQState.active = false;
            return "🏁 تست هوش تمام شده است.";
        }

        return `💡 <strong>جواب سؤال ${myAIIQState.index + 1}:</strong><br><br>
        ${q.answer}<br><br>
        حالا اگر خواستی ادامه بدیم، سؤال بعدی رو خودت حل کن. 🧠😎`;
    }

    return null;
}

function getMyAIGameExitRequest(message) {
    const text = normalizeMyAIText(message);

    const requests = [
        "خروج",
        "خروج از بازی",
        "بازی رو تموم کن",
        "بازی را تموم کن",
        "بازی رو تمام کن",
        "بازی را تمام کن",
        "پایان بازی",
        "تمومش کن",
        "تمامش کن",
        "دیگه نمیخوام بازی کنم",
        "دیگه نمی خوام بازی کنم"
    ];

    if (requests.some((item) => text === normalizeMyAIText(item))) {
        myAIGame = null;
        myAIIQState = null;

        return `🏁 <strong>باشه آراز!</strong><br><br>
        بازی رو تموم کردیم. 😊<br>
        حالا می‌تونی هر سؤال دیگه‌ای که خواستی بپرسی. 🧠✨`;
    }

    return null;
}

function tryMyAIIQGame(message) {
    if (!myAIIQState || !myAIIQState.active) {
        return null;
    }

    const text = normalizeMyAIText(message);

    if (!text) {
        return null;
    }

    const q = myAIIQState.questions[myAIIQState.index];

    if (!q) {
        myAIIQState.active = false;
        return "🏁 تست هوش قبلاً تمام شده است.";
    }

    const answerMap = {
        "1": q.answers[0],
        "۲": q.answers[0],
        "2": q.answers[1],
        "۲": q.answers[1],
        "3": q.answers[2],
        "۳": q.answers[2],
        "4": q.answers[3],
        "۴": q.answers[3]
    };

    let answer = text;

    if (answerMap[text]) {
        answer = normalizeMyAIText(answerMap[text]);
    }

    if (answer === normalizeMyAIText(q.answer)) {
        myAIIQState.score += 10;
        myAIGameScore += 10;
        saveMyAIScore();

        myAIIQState.index++;

        if (myAIIQState.index >= myAIIQState.questions.length) {
            myAIIQState.active = false;

            return `🎉 <strong>آفرین آراز!</strong><br><br>
            تست هوش تمام شد. 🧠🏆<br>
            امتیاز این تست: ⭐ ${myAIIQState.score}<br>
            امتیاز کل تو: 🏆 ${myAIGameScore}<br><br>
            خیلی خوب فکر کردی! 👏😎`;
        }

        const next = myAIIQState.questions[myAIIQState.index];

        return `✅ <strong>درست بود!</strong> +۱۰ امتیاز 🎉<br><br>
        سؤال ${myAIIQState.index + 1} از ${myAIIQState.questions.length}:<br>
        ${next.question}<br><br>
        گزینه‌ها:<br>
        1️⃣ ${next.answers[0]}<br>
        2️⃣ ${next.answers[1]}<br>
        3️⃣ ${next.answers[2]}<br>
        4️⃣ ${next.answers[3]}<br><br>
        جواب خودت را بگو. 🧠`;
    }

    return `❌ این جواب درست نیست.<br><br>
    دوباره فکر کن آراز! 😎🧠<br>
    هنوز روی همین سؤال هستیم:<br>
    ${q.question}<br><br>
    گزینه‌ها:<br>
    1️⃣ ${q.answers[0]}<br>
    2️⃣ ${q.answers[1]}<br>
    3️⃣ ${q.answers[2]}<br>
    4️⃣ ${q.answers[3]}`;
}

function startMyAIRiddleGame() {
    const riddles = [
        {
            question: "چیزی هست که هرچه بیشتر از آن برداری، بزرگ‌تر می‌شود. چیست؟",
            answer: "چاله",
            hint: "هرچه بیشتر از آن برداری، جای خالیِ آن بیشتر می‌شود."
        },
        {
            question: "چه چیزی همیشه جلوی توست، ولی نمی‌توانی آن را ببینی؟",
            answer: "آینده",
            hint: "هنوز اتفاق نیفتاده است."
        },
        {
            question: "چه چیزی دندان دارد ولی نمی‌تواند گاز بگیرد؟",
            answer: "شانه",
            hint: "موهایت را با آن مرتب می‌کنی."
        },
        {
            question: "چه چیزی وقتی گرم است آب است و وقتی سرد می‌شود جامد می‌شود؟",
            answer: "یخ",
            hint: "وقتی خیلی سرد شود، آب تبدیل به آن می‌شود."
        },
        {
            question: "چه چیزی پوسته دارد ولی درخت نیست و داخلش را معمولاً برای غذا استفاده می‌کنیم؟",
            answer: "تخم مرغ",
            hint: "صبحانه خیلی‌ها با آن شروع می‌شود."
        },
        {
            question: "چه چیزی هرچه بیشتر خشک می‌کند، خودش خیس‌تر می‌شود؟",
            answer: "حوله",
            hint: "بعد از حمام معمولاً از آن استفاده می‌کنی."
        },
        {
            question: "چه چیزی پا دارد ولی نمی‌تواند راه برود؟",
            answer: "میز",
            hint: "معمولاً چهار تا از آن‌ها دارد."
        },
        {
            question: "چه چیزی کلید دارد ولی هیچ دری را باز نمی‌کند؟",
            answer: "پیانو",
            hint: "با کلیدهایش موسیقی می‌نوازی."
        },
        {
            question: "چه چیزی زبان دارد ولی نمی‌تواند حرف بزند؟",
            answer: "کفش",
            hint: "قسمتی از آن زیر بندهای کفش قرار می‌گیرد."
        },
        {
            question: "چه چیزی بالا می‌رود ولی هیچ‌وقت پایین نمی‌آید؟",
            answer: "سن",
            hint: "هر سال یکی به آن اضافه می‌شود."
        },
        {
            question: "اگر سه سیب داشته باشی و یکی را برداری، چند سیب داری؟",
            answer: "یک",
            hint: "سؤال می‌گوید چند سیب را برداشته‌ای."
        },
        {
            question: "چه چیزی شب ظاهر می‌شود و روز ناپدید می‌شود، ولی خودش جابه‌جا نشده است؟",
            answer: "ستاره",
            hint: "شب‌ها در آسمان دیده می‌شود."
        },
        {
            question: "چه چیزی می‌تواند دور دنیا سفر کند، ولی از گوشه‌ی خودش تکان نخورد؟",
            answer: "تمبر",
            hint: "روی نامه قرار می‌گیرد."
        },
        {
            question: "چه چیزی هرچه بیشتر جلو بروی، بیشتر پشت سرت می‌ماند؟",
            answer: "ردپا",
            hint: "وقتی راه می‌روی، روی زمین ایجاد می‌شود."
        },
        {
            question: "چه چیزی بدون بال پرواز می‌کند و بدون دهان می‌گرید؟",
            answer: "ابر",
            hint: "وقتی در آسمان باشد و باران ببارد، زمین خیس می‌شود."
        }
    ];

    const riddle = riddles[Math.floor(Math.random() * riddles.length)];

    myAIGame = {
        type: "riddle",
        answer: riddle.answer,
        hint: riddle.hint
    };

    return `
        🧠🎮 <strong>مسابقه‌ی معمای آراز شروع شد!</strong> 🏆<br><br>
        🥋 قهرمان، ببین می‌تونی این یکی رو حل کنی؟ 😎<br><br>
        ❓ ${escapeHtml(riddle.question)}<br><br>
        حدست چیه؟ 🤔
    `;
}

function isMyAIGameAnswerRequest(text) {
    const requests = [
        "جوابش چیه",
        "جواب چیه",
        "جواب رو بگو",
        "جوابشو بگو",
        "جوابش رو بگو",
        "جوابش رو نمی گی",
        "جوابش رو نمی گی؟",
        "جواب رو نمی گی",
        "جواب رو نمی گی؟",
        "پاسخ رو بگو",
        "پاسخش رو بگو",
        "پاسخش چیه",
        "پاسخ چیه",
        "جوابو بگو",
        "جوابو بگو؟",
        "جوابش رو می گی",
        "جوابش رو میگی"
    ];

    return requests.some(
        (item) => text === normalizeMyAIText(item)
    );
}

function tryMyAIWordGame(message) {
    if (!myAIGame || myAIGame.type !== "word") {
        return null;
    }

    const text = normalizeMyAIText(message);

    if (isMyAIGameAnswerRequest(text)) {
        const answers = myAIGame.answers;

        myAIGame = null;

        return `
            😄 چند جواب درست داشت!<br><br>
            💡 مثلاً: <strong>${escapeHtml(answers[0])}</strong><br><br>
            آفرین که تلاش کردی قهرمان! 🧠🥋<br>
            برای بازی بعدی بگو: «بازی کلمات» 🔤
        `;
    }

    const isCorrect = myAIGame.answers.some(
        (answer) => text === normalizeMyAIText(answer)
    );

    if (isCorrect) {
        const answer = message.trim();

        myAIGameScore += 10;
        saveMyAIScore();
        myAIGame = null;

        return `
            🎉🎉 آفرین آراز! درست گفتی! 🏆🥋<br><br>
            جواب <strong>${escapeHtml(answer)}</strong> قبول شد! 👏😎<br>
            ⭐ <strong>۱۰ امتیاز</strong> گرفتی!<br><br>
            🏆 امتیاز فعلی تو: <strong>${myAIGameScore}</strong><br><br>
            برای بازی بعدی بگو: «بازی کلمات» 🔤🎮
        `;
    }

    return `
        🤔 این جواب توی جواب‌های این مرحله نبود، قهرمان!<br><br>
        یک کلمه‌ی دیگه امتحان کن. 🧠💪<br>
        دوباره جواب بده! 🚀
    `;
}

function tryMyAINumberGame(message) {
    if (!myAIGame || myAIGame.type !== "number") {
        return null;
    }

    const text = normalizeMyAIText(message);

    if (isMyAIGameAnswerRequest(text)) {
        const answer = myAIGame.answer;

        myAIGame = null;

        return `
            😄 جوابش <strong>${escapeHtml(answer)}</strong> بود!<br><br>
            آفرین که تلاش کردی قهرمان! 🧠🥋<br>
            برای چالش بعدی فقط بگو: «چالش عددی» 🎯
        `;
    }

    if (text === normalizeMyAIText(myAIGame.answer)) {
        const answer = myAIGame.answer;

        myAIGameScore += 10;
        saveMyAIScore();
        myAIGame = null;

        return `
            🎉🎉 آفرین آراز! درست گفتی! 🏆🥋<br><br>
            جواب <strong>${escapeHtml(answer)}</strong> بود. 👏😎<br>
            ⭐ <strong>۱۰ امتیاز</strong> گرفتی!<br><br>
            🏆 امتیاز فعلی تو: <strong>${myAIGameScore}</strong><br><br>
            برای چالش بعدی بگو: «چالش عددی» 🎯🔢
        `;
    }

    return `
        🤔 هنوز درست نیست قهرمان!<br><br>
        دوباره حساب کن؛ مطمئنم می‌تونی! 💪🧠<br>
        جواب رو دوباره بفرست. 🚀
    `;
}

function tryMyAIRiddleGame(message) {
    if (!myAIGame || myAIGame.type !== "riddle") {
        return null;
    }

    const text = normalizeMyAIText(message);

    const newRiddleRequests = [
        "یه معما بگو",
        "یک معما بگو",
        "معما بگو",
        "یه چیستان بگو",
        "یک چیستان بگو",
        "چیستان بگو",
        "بازی فکری",
        "یه بازی فکری",
        "یک بازی فکری"
    ];

    if (newRiddleRequests.some((item) => text === normalizeMyAIText(item))) {
        return startMyAIRiddleGame();
    }

    if (
        text === "راهنمایی" ||
        text === "یه راهنمایی" ||
        text === "یک راهنمایی" ||
        text === "کمک"
    ) {
        return `
            💡 <strong>راهنمایی:</strong><br>
            ${escapeHtml(myAIGame.hint)} 😉
        `;
    }

    if (isMyAIGameAnswerRequest(text)) {
        const answer = myAIGame.answer;

        myAIGame = null;

        return `
            😄 جوابش <strong>${escapeHtml(answer)}</strong> بود!<br><br>
            اشکالی نداره قهرمان؛ معمای بعدی می‌تونه سخت‌تر و باحال‌تر باشه. 🧠🥋
        `;
    }

    if (text === normalizeMyAIText(myAIGame.answer)) {
        const answer = myAIGame.answer;

        myAIGameScore += 10;
        saveMyAIScore();
        myAIGame = null;

        return `
            🎉🎉 آفرین آراز! درست گفتی! 🏆🥋<br><br>
            جواب <strong>${escapeHtml(answer)}</strong> بود. 👏😎<br>
            ⭐ <strong>۱۰ امتیاز</strong> گرفتی!<br><br>
            🏆 امتیاز فعلی تو: <strong>${myAIGameScore}</strong><br><br>
            برای معمای بعدی فقط بگو: «یه معما بگو» 🧠🎮
        `;
    }

    return `
        🤔 نه قهرمان، این جواب نیست.<br><br>
        دوباره فکر کن؛ عجله‌ای نداریم! 😎🧠<br>
        اگر خواستی بگو <strong>«راهنمایی»</strong> تا یک سرنخ بهت بدم. 💡
    `;
}


function startMyAINumberGame() {
    const challenges = [
        {
            question: "۲۷ + ۱۵ چند می‌شود؟",
            answer: "۴۲"
        },
        {
            question: "۵ × ۸ چند می‌شود؟",
            answer: "۴۰"
        },
        {
            question: "۶۰ ÷ ۵ چند می‌شود؟",
            answer: "۱۲"
        },
        {
            question: "اگر ۳ تا سیب داشته باشی و ۴ تا دیگر بگیری، چند سیب داری؟",
            answer: "۷"
        },
        {
            question: "۱۰ تا شکلات داری و ۳ تا از آن‌ها را می‌خوری. چند تا می‌ماند؟",
            answer: "۷"
        }
    ];

    const challenge =
        challenges[Math.floor(Math.random() * challenges.length)];

    myAIGame = {
        type: "number",
        answer: challenge.answer
    };

    return `
        🎯🔢 <strong>چالش عددی آراز شروع شد!</strong> 🏆<br><br>
        قهرمان، ببین این یکی رو می‌تونی حل کنی؟ 😎🧠<br><br>
        ❓ ${escapeHtml(challenge.question)}<br><br>
        جواب رو بنویس! 🚀
    `;
}

function startMyAIWordGame() {
    const challenges = [
        {
            question: "با حرف «م» یک میوه نام ببر.",
            answers: ["موز", "مانگو"]
        },
        {
            question: "با حرف «س» یک حیوان نام ببر.",
            answers: ["سگ", "سمور", "سنجاب", "سوسمار"]
        },
        {
            question: "با حرف «ب» یک کشور نام ببر.",
            answers: ["برزیل", "بحرین", "بلژیک", "بنگلادش"]
        },
        {
            question: "با حرف «ک» یک وسیله نام ببر.",
            answers: ["کتری", "کمد", "کوله", "کفش"]
        },
        {
            question: "با حرف «د» یک خوراکی نام ببر.",
            answers: ["دونات", "دلمه", "دوغ"]
        }
    ];

    const challenge =
        challenges[Math.floor(Math.random() * challenges.length)];

    myAIGame = {
        type: "word",
        answers: challenge.answers
    };

    return `
        🔤🎮 <strong>بازی کلمات آراز شروع شد!</strong> 🏆<br><br>
        قهرمان، ببین می‌تونی این یکی رو حل کنی؟ 😎🧠<br><br>
        ❓ ${escapeHtml(challenge.question)}<br><br>
        جواب رو بنویس! 🚀
    `;
}

function getMyAIWordGameRequest(message) {
    const text = normalizeMyAIText(message);

    const requests = [
        "بازی کلمات",
        "یه بازی کلمات",
        "یک بازی کلمات",
        "بازی کلمه",
        "چالش کلمات",
        "چالش کلمه"
    ];

    if (
        myAIVisitorName === "آراز" &&
        requests.some((item) => text === normalizeMyAIText(item))
    ) {
        return startMyAIWordGame();
    }

    return null;
}

function getMyAINumberGameRequest(message) {
    const text = normalizeMyAIText(message);

    const requests = [
        "چالش عددی",
        "یه چالش عددی",
        "یک چالش عددی",
        "بازی عددی",
        "چالش اعداد"
    ];

    if (
        myAIVisitorName === "آراز" &&
        requests.some((item) => text === normalizeMyAIText(item))
    ) {
        return startMyAINumberGame();
    }

    return null;
}

function getMyAIIQRequest(message) {
    const text = normalizeMyAIText(message);

    const requests = [
        "تست هوش",
        "یه تست هوش",
        "یک تست هوش",
        "تست هوش بده",
        "تست هوش بگیر",
        "بازی تست هوش"
    ];

    if (requests.some((item) => text === normalizeMyAIText(item))) {
        return startMyAIIQGame();
    }

    return null;
}

function getMyAIRiddleRequest(message) {
    const text = normalizeMyAIText(message);

    const requests = [
        "یه معما بگو",
        "یک معما بگو",
        "معما بگو",
        "یه چیستان بگو",
        "یک چیستان بگو",
        "چیستان بگو",
        "بازی فکری",
        "یه بازی فکری",
        "یک بازی فکری"
    ];

    if (
        myAIVisitorName === "آراز" &&
        requests.some((item) => text === normalizeMyAIText(item))
    ) {
        return startMyAIRiddleGame();
    }

    return null;
}

function tryMyAIWeightMath(message) {
    const text = String(message || "")
        .replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));

    const m = text.match(/(\d+)\s*کیلو\s*و\s*(\d+)\s*گرم\s*منها(?:ی)?\s*(\d+)\s*کیلو\s*و\s*(\d+)\s*گرم/);

    if (!m) return null;

    const first = Number(m[1]) * 1000 + Number(m[2]);
    const second = Number(m[3]) * 1000 + Number(m[4]);
    const result = first - second;

    if (result < 0) return "نتیجه منفی است.";

    const kg = Math.floor(result / 1000);
    const grams = result % 1000;

    let answer = "";

    if (kg > 0) answer += kg + " کیلو";
    if (grams > 0) answer += (answer ? " و " : "") + grams + " گرم";
    if (!answer) answer = "۰ گرم";

    return `حاصل محاسبه: <strong>${escapeHtml(answer)}</strong>`;
}

function tryMyAIMath(message) {
    let expression = String(message || "").trim();

    if (!expression) return null;

    expression = expression
        .replace(/[۰-۹]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹".indexOf(digit))
        .replace(/٫/g, ".")
        .replace(/[×✕✖]/g, "*")
        .replace(/[÷]/g, "/")
        .replace(/[−–—]/g, "-")
        .replace(/[٪%]/g, "%")
        .replace(/درصد/g, "%")
        .replace(/به توان/g, "^");

    expression = expression
        .replace(/چند(?:ه|است)?/g, "")
        .replace(/چقدر(?:ه|است)?/g, "")
        .replace(/میشه/g, "")
        .replace(/می\s*شود/g, "")
        .replace(/است/g, "")
        .replace(/حساب\s*کن/g, "")
        .replace(/حسابش\s*کن/g, "")
        .replace(/حاصل/g, "")
        .replace(/محاسبه/g, "")
        .replace(/کن/g, "")
        .replace(/لطفا/g, "")
        .replace(/لطفاً/g, "")
        .trim();

    expression = expression
        .replace(
            /(\d+(?:\.\d+)?)\s*%\s*(\d+(?:\.\d+)?)/g,
            "($1*$2/100)"
        )
        .replace(
            /(\d+(?:\.\d+)?)\s*%/g,
            "($1/100)"
        );

    if (!/[0-9]/.test(expression)) return null;

    if (!/^[0-9+\-*/%^().\s]+$/.test(expression)) {
        return null;
    }

    if (expression.length > 100) {
        return null;
    }

    if (expression.includes("/0")) {
        return "تقسیم بر صفر امکان‌پذیر نیست.";
    }

    const operators = expression.match(/[+\-*/%^]/g) || [];

    if (operators.length === 0 && !/[0-9]/.test(expression)) {
        return null;
    }

    try {
        const tokens = expression.match(
            /(\d+(?:\.\d+)?)|([+\-*/%^()])/g
        );

        if (!tokens) return null;

        const values = [];
        const ops = [];

        const precedence = {
            "+": 1,
            "-": 1,
            "*": 2,
            "/": 2,
            "%": 2,
            "^": 3
        };

        const applyOperator = () => {
            const op = ops.pop();

            if (op === "(") return;

            const b = values.pop();
            const a = values.pop();

            if (a === undefined || b === undefined) {
                throw new Error("invalid");
            }

            let result;

            if (op === "+") result = a + b;
            else if (op === "-") result = a - b;
            else if (op === "*") result = a * b;
            else if (op === "/") {
                if (b === 0) throw new Error("zero");
                result = a / b;
            }
            else if (op === "%") result = a % b;
            else if (op === "^") result = Math.pow(a, b);
            else throw new Error("invalid");

            if (!Number.isFinite(result)) {
                throw new Error("invalid");
            }

            values.push(result);
        };

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            if (/^\d/.test(token)) {
                values.push(Number(token));
                continue;
            }

            if (token === "(") {
                ops.push(token);
                continue;
            }

            if (token === ")") {
                while (ops.length && ops[ops.length - 1] !== "(") {
                    applyOperator();
                }

                if (!ops.length) throw new Error("invalid");

                ops.pop();
                continue;
            }

            while (
                ops.length &&
                ops[ops.length - 1] !== "(" &&
                (
                    precedence[ops[ops.length - 1]] > precedence[token] ||
                    (
                        precedence[ops[ops.length - 1]] === precedence[token] &&
                        token !== "^"
                    )
                )
            ) {
                applyOperator();
            }

            ops.push(token);
        }

        while (ops.length) {
            if (ops[ops.length - 1] === "(") {
                throw new Error("invalid");
            }

            applyOperator();
        }

        if (values.length !== 1) {
            return null;
        }

        const result = values[0];

        const formatted = Number.isInteger(result)
            ? String(result)
            : String(Number(result.toFixed(10)));

        return `حاصل محاسبه: <strong>${escapeHtml(formatted)}</strong>`;
    } catch (error) {
        if (error.message === "zero") {
            return "تقسیم بر صفر امکان‌پذیر نیست.";
        }

        return null;
    }
}

function analyzeMyAINote(note) {
    const text = String(note?.text || "");

    const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    const sections = {
        materials: [],
        preparation: [],
        cooking: [],
        drying: [],
        shaping: [],
        tips: [],
        amounts: [],
        other: []
    };

    const headingRules = [
        {
            type: "materials",
            patterns: ["مواد لازم", "مواد اولیه", "ترکیبات"]
        },
        {
            type: "preparation",
            patterns: [
                "طرز تهیه",
                "مراحل آماده سازی",
                "مراحل آماده‌سازی",
                "روش تهیه",
                "آماده سازی",
                "آماده‌سازی",
                "مراحل کار",
                "مراحل انجام"
            ]
        },
        {
            type: "cooking",
            patterns: ["پخت", "پختن", "پیش پخت", "پیش‌پخت"]
        },
        {
            type: "drying",
            patterns: ["خشک کردن", "خشک‌کردن", "خشک شدن"]
        },
        {
            type: "shaping",
            patterns: ["شکل دادن", "شکل‌دهی", "شکل دهی"]
        },
        {
            type: "tips",
            patterns: ["نکات", "نکات طلایی", "ترفند", "ترفندها", "نکته"]
        }
    ];

    const normalize = (value) => normalizeMyAIText(value);

    const getHeadingType = (line) => {
        const value = normalize(line)
            .replace(/^[^\p{L}\p{N}]+/u, "")
            .trim();

        for (const rule of headingRules) {
            for (const pattern of rule.patterns) {
                const normalizedPattern = normalize(pattern);

                if (
                    value === normalizedPattern ||
                    value.startsWith(normalizedPattern + " ")
                ) {
                    return rule.type;
                }
            }
        }

        return null;
    };

    let currentSection = "other";

    lines.forEach((line) => {
        const detectedSection = getHeadingType(line);

        if (detectedSection) {
            currentSection = detectedSection;
            sections[currentSection].push(line);
            return;
        }

        const normalizedLine = normalize(line);

        const amountLike =
            /\d/.test(line) &&
            (
                normalizedLine.includes("گرم") ||
                normalizedLine.includes("کیلو") ||
                normalizedLine.includes("قاشق") ||
                normalizedLine.includes("پیمانه") ||
                normalizedLine.includes("عدد") ||
                normalizedLine.includes("درجه") ||
                normalizedLine.includes("دقیقه") ||
                normalizedLine.includes("ساعت") ||
                normalizedLine.includes("میلی")
            );

        if (amountLike) {
            sections.amounts.push(line);
        }

        sections[currentSection].push(line);
    });

    return {
        title: note?.title || "",
        sections
    };
}

function detectMyAIIntent(query) {
    const text = normalizeMyAIText(query);

    if (!text) {
        return "general";
    }

    const intentRules = [
        {
            type: "materials",
            keywords: [
                "مواد لازم",
                "موادلازم",
                "مواد اولیه",
                "ترکیبات",
                "چی لازم دارم",
                "چه چیزهایی لازم",
                "موادش"
            ]
        },
        {
            type: "preparation",
            keywords: [
                "طرز تهیه",
                "چطور درست",
                "چجوری درست",
                "چگونه درست",
                "روش تهیه",
                "نحوه تهیه",
                "نحوه درست کردن",
                "روش درست کردن",
                "مراحل تهیه",
                "مراحل انجام",
                "مراحل کار"
            ]
        },
        {
            type: "amount",
            keywords: [
                "چقدر",
                "چه مقدار",
                "چه میزان",
                "مقدار",
                "میزان",
                "چند گرم",
                "چند کیلو",
                "هر وعده",
                "در هر وعده",
                "روزانه",
                "در روز"
            ]
        },
        {
            type: "cooking",
            keywords: [
                "دما",
                "درجه",
                "چند درجه",
                "زمان پخت",
                "چقدر بپزه",
                "چقدر بپزم",
                "چند دقیقه",
                "چند ساعت",
                "فر",
                "ایرفرایر"
            ]
        },
        {
            type: "shaping",
            keywords: [
                "شکل",
                "شکل دادن",
                "شکل دهی",
                "ضخامت",
                "قطر",
                "اندازه"
            ]
        },
        {
            type: "drying",
            keywords: [
                "خشک کردن",
                "چطور خشک",
                "چجوری خشک",
                "خشک",
                "میوه خشک کن"
            ]
        },
        {
            type: "tips",
            keywords: [
                "نکته",
                "نکات",
                "ترفند",
                "نکات طلایی",
                "چه نکته ای",
                "چه نکاتی"
            ]
        }
    ];

    for (const rule of intentRules) {
        if (
            rule.keywords.some((keyword) =>
                text.includes(normalizeMyAIText(keyword))
            )
        ) {
            return rule.type;
        }
    }

    return "general";
}


function getMyAIIntentContent(noteItem, intent) {
    if (!noteItem) {
        return "";
    }

    const blocks = splitMyAINoteBlocks(noteItem);

    if (!blocks.length) {
        return "";
    }

    const getBlocksByType = (type) =>
        blocks.filter(
            (block) =>
                block.type === type &&
                block.lines &&
                block.lines.length > 0
        );

    if (intent === "materials") {
        const materialBlocks = getBlocksByType("materials");

        if (!materialBlocks.length) {
            return "";
        }

        const selectedBlock =
            materialBlocks[materialBlocks.length - 1];

        return [
            selectedBlock.heading,
            ...selectedBlock.lines
        ].join("\n");
    }

    if (intent === "preparation") {
        const preparationBlocks =
            getBlocksByType("preparation");

        if (!preparationBlocks.length) {
            return "";
        }

        const selectedBlock =
            preparationBlocks[preparationBlocks.length - 1];

        return [
            selectedBlock.heading,
            ...selectedBlock.lines
        ].join("\n");
    }

    if (intent === "shaping") {
        return getBlocksByType("shaping")
            .map((block) =>
                [block.heading, ...block.lines].join("\n")
            )
            .join("\n\n");
    }

    if (intent === "drying") {
        return getBlocksByType("drying")
            .map((block) =>
                [block.heading, ...block.lines].join("\n")
            )
            .join("\n\n");
    }

    if (intent === "tips") {
        return getBlocksByType("tips")
            .map((block) =>
                [block.heading, ...block.lines].join("\n")
            )
            .join("\n\n");
    }

    if (intent === "amount") {
        const amountLines = [];

        blocks.forEach((block) => {
            block.lines.forEach((line) => {
                const value = normalizeMyAIText(line);

                if (
                    /\d/.test(line) &&
                    [
                        "گرم",
                        "کیلو",
                        "قاشق",
                        "پیمانه",
                        "عدد",
                        "درجه",
                        "دقیقه",
                        "ساعت",
                        "میلی"
                    ].some((keyword) =>
                        value.includes(
                            normalizeMyAIText(keyword)
                        )
                    )
                ) {
                    amountLines.push(line);
                }
            });
        });

        return [...new Set(amountLines)].join("\n");
    }

    if (intent === "cooking") {
        const cookingLines = [];

        blocks.forEach((block) => {
            [...block.lines, block.heading].forEach((line) => {
                const value = normalizeMyAIText(line);

                if (
                    [
                        "درجه",
                        "دقیقه",
                        "ساعت",
                        "فر",
                        "ایرفرایر",
                        "پخت"
                    ].some((keyword) =>
                        value.includes(
                            normalizeMyAIText(keyword)
                        )
                    )
                ) {
                    cookingLines.push(line);
                }
            });
        });

        return [...new Set(cookingLines)].join("\n");
    }

    return "";
}

function composeMyAIAnswer(noteItem, intent) {
    const content = getMyAIIntentContent(noteItem, intent);

    if (!content) {
        return "";
    }

    const introMap = {
        materials: "حتماً 🌷 این هم مواد لازم:",
        preparation: "حتماً 🍳 مراحل تهیه اینه:",
        amount: "حتماً 📏 مقدارهایی که در یادداشتت ثبت شده:",
        cooking: "حتماً 🔥 اطلاعات مربوط به پخت:",
        shaping: "حتماً ✨ روش شکل دادن:",
        drying: "حتماً 🌬️ روش خشک کردن:",
        tips: "حتماً 💡 نکات ثبت‌شده:"
    };

    const intro = introMap[intent] || "این اطلاعات را در یادداشتت پیدا کردم:";

    return `
        ${intro}
        <br><br>
        ${escapeHtml(content).replace(/\n/g, "<br>")}
    `;
}


function splitMyAINoteBlocks(note) {
    const text = String(note?.text || "");

    const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    const blocks = [];
    let current = null;

    const headingRules = [
        {
            type: "materials",
            patterns: [
                "مواد لازم",
                "مواد اولیه",
                "ترکیبات"
            ]
        },
        {
            type: "preparation",
            patterns: [
                "طرز تهیه",
                "مراحل آماده سازی",
                "مراحل آماده‌سازی"
            ]
        },
        {
            type: "shaping",
            patterns: [
                "شکل دادن",
                "شکل‌دهی",
                "شکل دهی"
            ]
        },
        {
            type: "drying",
            patterns: [
                "خشک کردن",
                "خشک‌کردن"
            ]
        },
        {
            type: "tips",
            patterns: [
                "نکات طلایی",
                "نکات",
                "ترفندها",
                "ترفند"
            ]
        }
    ];

    const getHeading = (line) => {
        const normalized = normalizeMyAIText(line);

        for (const rule of headingRules) {
            for (const pattern of rule.patterns) {
                const value = normalizeMyAIText(pattern);

                if (
                    normalized === value ||
                    normalized.startsWith(value + " ") ||
                    normalized.includes(" " + value + " ")
                ) {
                    return {
                        type: rule.type,
                        heading: line
                    };
                }
            }
        }

        return null;
    };

    lines.forEach((line) => {
        const detected = getHeading(line);

        if (detected) {
            if (current && current.lines.length > 0) {
                blocks.push(current);
            }

            current = {
                heading: line,
                type: detected.type,
                lines: []
            };

            return;
        }

        if (!current) {
            current = {
                heading: "",
                type: "other",
                lines: []
            };
        }

        current.lines.push(line);
    });

    if (current && current.lines.length > 0) {
        blocks.push(current);
    }

    return blocks;
}

function buildMyAINoteIndex() {
    const context = getMyAIContext();

    return context.map((note) => ({
        section: note.section,
        title: note.title,
        text: note.text,
        analysis: analyzeMyAINote(note)
    }));
}


function escapeHtml(text) {
    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}

function goHome() {
    clearTimeout(autoSaveTimer);
    location.reload();
}

renderCustomSections();
