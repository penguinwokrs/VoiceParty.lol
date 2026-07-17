import type { PartialTranslationResources } from "./ja";

// Traditional Chinese (Taiwan / Hong Kong / Macau).
//
// Scoped to the UI on purpose. `legal.privacy`, `legal.terms`, `legal.updated`
// and `legal.disclaimer` are deliberately absent so i18next falls back to
// English: those texts went through legal review (#41) and an unreviewed
// translation of a privacy policy / ToS carries real legal risk. Add them here
// only once a reviewed translation exists.
//
// `legal.nav` IS translated — the footer links render on every page, not just
// the legal ones.
//
// Region note: the Riot API has no mainland-China platform (Tencent operates
// LoL there), so the audience for this locale is tw2 — hence Traditional.
export const zhTW: PartialTranslationResources = {
	landing: {
		eyebrow: "瀏覽器語音 · 免安裝",
		title: "VoiceCrew",
		headline: "決定組隊前，先聽一句。",
		lead: "在 LFG 找到雙排？週末要湊五排？傳一條連結，在交換 Discord 之前先用語音確認彼此。",
		ctaStart: "建立房間",
		ctaHow: "使用方式",
		trust: {
			noDownload: "免下載",
			browser: "瀏覽器就能用",
			muted: "路人進不來",
		},
		panel: {
			ariaLabel:
				"VoiceCrew 通話畫面：三名隊友正在語音通話，其中一人發言中，並有麥克風、降噪與離開的控制項。",
		},
		why: {
			eyebrow: "概念",
			heading: "單排？全部靜音才是正解。自己挑的隊友？那就另當別論。",
			body: "VoiceCrew 不與靜音文化對抗，而是站在它的另一側。沒有人想和四個路人開語音；但和自己挑的人，每個人都想聊。",
			cold: {
				tag: "/mute all",
				title: "全是陌生人的大廳",
				body: "沒麥克風、沒溝通、不必了。對於不是你挑的人，沉默才是正確設定。",
			},
			warm: {
				tag: "on the line",
				title: "你自己挑的人",
				body: "你的雙排。你週末的五排。傳一條連結，在正式開打前先熱身你的聲音。",
			},
		},
		features: {
			eyebrow: "用途",
			heading: "一條連結。二到五人。然後再決定。",
			items: {
				micCheck: {
					title: "只是試音，不是結婚",
					body: "試試雙排，或讓五排先熱身。感覺不對，三十秒就能離開。不用帳號，不留紀錄。",
				},
				onlyYouPick: {
					title: "只有你挑的人",
					body: "不和陌生人配對。分享房間連結——只有拿到連結的人能和你通話。",
				},
				beforeDiscord: {
					title: "Discord 之前的那一步",
					body: "這不是 Discord 的替代品，而是在你為十分鐘前才認識的人開伺服器之前，先做的事。",
				},
			},
		},
		steps: {
			eyebrow: "使用方式",
			heading: "從連結到開口，不用一分鐘。",
			items: {
				riotId: {
					title: "輸入你的 Riot ID",
					body: "Name#Tag，免下載，直接在瀏覽器裡。",
				},
				shareLink: {
					title: "分享房間連結",
					body: "貼到 LFG、私訊或你的直播。一鍵加入。",
				},
				micCheck: {
					title: "試音",
					body: "聊聊看，感受氣氛，確認溝通是否真的合拍。",
				},
				commit: {
					title: "組隊——或離開",
					body: "加 Discord、再來一場，或乾脆俐落地離開。你決定。",
				},
			},
		},
		safety: {
			eyebrow: "安全",
			heading: "陌生人不是被靜音，而是根本進不來。",
			body: "每個房間都內建一鍵檢舉與本機靜音、年齡確認，以及內容管理。聲音要給誰由你決定，而且隨時可以切回靜音。",
		},
		finalCta: {
			eyebrow: "準備好就開始",
			heading: "把你的隊友拉上線。",
			body: "免安裝。沒有註冊門檻。只要一條連結和一次試音——在你決定和誰組隊之前。",
			ctaStart: "建立房間",
			ctaHow: "看看怎麼用",
		},
		footer: "© {{year}} VoiceCrew.",
	},
	app: {
		subtitle: "即時語音通話",
	},
	join: {
		heading: "語音通話",
		summonerId: "召喚師名稱",
		summonerIdPlaceholder: "輸入你的名稱",
		gameId: "遊戲 ID",
		gameIdPlaceholder: "輸入要加入的遊戲 ID",
		region: "伺服器",
		regionPlaceholder: "選擇你的伺服器",
		regionFromLink: "由邀請連結指定——不同伺服器無法一起遊玩",
		joinGame: "加入遊戲",
		consent:
			"按下「加入遊戲」即表示你同意<terms>服務條款</terms>與<privacy>隱私權政策</privacy>。你必須年滿 13 歲才能使用本服務。",
		ageTitle: "年齡確認",
		ageBody: "使用本服務需年滿 13 歲。請輸入你的出生年份。",
		ageYearLabel: "出生年份（西元）",
		ageConfirm: "確認並繼續",
		ageTooYoung: "本服務僅限年滿 13 歲的使用者。",
		ageInvalid: "請輸入有效的年份。",
	},
	session: {
		label: "工作階段",
		connected: "語音已連線",
		connecting: "連線中",
		disconnected: "連線已中斷",
		reconnecting: "重新連線中",
		reconnectingHint: "正在等待網路恢復，請稍候。",
		reconnect: "重新連線",
		share: "複製連結",
		shareOnX: "分享到 X",
		linkCopied: "已複製連結",
		shareText: "🎮 我正在 VoiceCrew 開語音一起玩！用這條連結加入我吧 👉",
		safetyNote:
			"🔒 語音不會被錄製。你可能會和陌生人交談——請勿分享個人資訊；若感到不適，可以靜音、檢舉或離開。",
		noiseSuppression: "降噪",
		noiseSuppressionOn: "降噪：開啟",
		noiseSuppressionOff: "降噪：關閉",
		volume: "{{name}} 的音量",
		mute: "靜音",
		unmute: "取消靜音",
		muted: "已靜音",
		muteName: "將 {{name}} 靜音",
		unmuteName: "取消 {{name}} 的靜音",
		participants: "參與者 ({{n}}/5)",
		you: "(你)",
		status: {
			connecting: "連線中",
			connected: "已連線",
			reconnecting: "重新連線中",
			disconnected: "已中斷",
		},
	},
	errors: {
		idsRequired: "請輸入召喚師名稱與遊戲 ID",
		joinFailed: "加入工作階段失敗",
		voiceConnectionFailed:
			"已加入工作階段，但語音連線失敗（請檢查主控台／憑證）",
		reconnectFailed: "重新連線失敗，請再試一次。",
	},
	language: {
		label: "語言",
	},
	report: {
		action: "檢舉",
		title: "檢舉原因",
		reportName: "檢舉 {{name}}",
		submitted: "已檢舉並靜音",
		reasons: {
			harassment: "騷擾／惡意行為",
			hate: "仇恨／歧視",
			child_safety: "兒童安全（性接觸／剝削）",
			illegal: "違法行為",
			cheating: "作弊",
			spam: "垃圾訊息",
			inappropriate_name: "不當名稱",
			other: "其他",
		},
	},
	legal: {
		// Footer links only — the policy prose itself falls back to English.
		nav: {
			home: "首頁",
			privacy: "隱私權政策",
			terms: "服務條款",
		},
	},
};
