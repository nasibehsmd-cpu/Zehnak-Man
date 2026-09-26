const sectionCards = document.querySelectorAll(".section-card");

let currentSection = "";
let editingIndex = null;
let autoSaveTimer = null;
let myAIConversationTopic = "";

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

    const topicPrompt = getMyAITopicPrompt(message);
    const smallTalkResponse = getMyAISmallTalkResponse(message);

    let response = "";

    if (smallTalkResponse) {
        response = smallTalkResponse;
    } else if (topicPrompt) {
        if (myAIConversationTopic) {
            myAIConversationTopic = `${myAIConversationTopic} ${message}`;
        } else {
            myAIConversationTopic = message;
        }

        response = topicPrompt;
    } else {
        const intent = detectMyAIIntent(message);

        const memoryQuery = myAIConversationTopic
            ? `${myAIConversationTopic} ${message}`
            : message;

        const results = myAIConversationTopic
            ? searchMyAIFocusedMemory(memoryQuery, myAIConversationTopic)
            : searchMyAIMemory(memoryQuery);

        if (intent !== "general" && myAIConversationTopic) {
            const topicText = normalizeMyAIText(myAIConversationTopic);

            const exactNote = getMyAIContext().find((item) => {
                const titleText = normalizeMyAIText(item.title);

                return (
                    titleText &&
                    (
                        topicText === titleText ||
                        topicText.includes(titleText)
                    )
                );
            });

            if (exactNote) {
                const smart = composeMyAIAnswer(exactNote, intent);

                if (smart) {
                    response = smart;
                }
            }
        }

        if (!response && intent !== "general" && results.length > 0) {
            const smartResponse = composeMyAIAnswer(
                results[0],
                intent
            );

            if (smartResponse) {
                response = smartResponse;
            }
        }

        if (!response && results.length === 0) {
            response = getMyAIGeneralResponse(message);
        }

        if (!response && results.length > 0) {
            const topResults = results.slice(0, 3);

            response = `
                <strong>چیزهایی که در یادداشت‌هایم پیدا کردم:</strong>
                <br><br>
                ${topResults.map((item) => `
                    <div style="margin-bottom: 12px;">
                        📁 <strong>${escapeHtml(item.section)}</strong>
                        <br>
                        📝 ${escapeHtml(item.title)}
                        <br>
                        ${escapeHtml(
                            extractRelevantText(item.text, memoryQuery)
                        ).replace(/\n/g, "<br>")}
                    </div>
                `).join("")}
            `;
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
    const emoji = prompt("ایموجی یا شکل جدید را وارد کن:");

    if (!emoji || !emoji.trim()) return;

    const value = emoji.trim();

    const customEmojis = JSON.parse(
        localStorage.getItem("nasibehMyAiCustomEmojis") || "[]"
    );

    if (defaultEmojis.includes(value) || customEmojis.includes(value)) {
        alert("این ایموجی قبلاً در کتابخانه وجود دارد.");
        return;
    }

    customEmojis.push(value);

    localStorage.setItem(
        "nasibehMyAiCustomEmojis",
        JSON.stringify(customEmojis)
    );

    renderEmojiLibrary();
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

    const confirmed = confirm(
        "آیا مطمئنی می‌خواهی این یادداشت را حذف کنی؟"
    );

    if (!confirmed) return;

    notes.splice(index, 1);

    saveAllNotes(notes);

    renderNotes();
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
