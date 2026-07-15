export const ja = {
	landing: {
		eyebrow: "リアルタイム音声",
		title: "Voice Party",
		subtitle:
			"仲間を集め、連携を決め、クリアな音声でリフトを制圧しよう。すべてブラウザだけで完結します。",
		cta: "参加する",
		scrollHint: "使い方",
		features: {
			eyebrow: "Why Voice Party",
			heading: "特長",
			items: {
				noInstall: {
					title: "インストール不要",
					body: "ブラウザだけでOK。アプリのダウンロードもアカウント登録も必要ありません。開いてすぐに話せます。",
				},
				clearVoice: {
					title: "クリアな音声",
					body: "低ノイズ・高音質のリアルタイム音声。ワンタップでミュートの切り替えができます。",
				},
				invite: {
					title: "リンクで即招待",
					body: "ゲームIDのURLを味方に共有するだけ。ワンクリックで同じボイスチャットに集まれます。",
				},
				lowLatency: {
					title: "低遅延・軽量",
					body: "世界中に分散したネットワークで、どこからでも遅延の少ない通話を実現します。",
				},
			},
		},
		steps: {
			eyebrow: "How it works",
			heading: "使い方はかんたん 4 ステップ",
			items: {
				enter: {
					title: "サモナー名とゲームIDを入力",
					body: "「参加」を押して、あなたのサモナー名と合言葉になるゲームIDを入力します。IDは味方と揃えれば何でもOKです。",
				},
				connect: {
					title: "ボイスチャットに接続",
					body: "「Join Game」を押すとマイクが有効になり、同じゲームIDの仲間と音声でつながります。",
				},
				share: {
					title: "URLを味方に共有",
					body: "ブラウザのURLをそのまま味方に送るだけ。受け取った人はリンクを開くと同じ部屋に参加できます。",
				},
				win: {
					title: "作戦を立てて勝利へ",
					body: "クリアな音声で連携し、リフトを制圧しましょう。退出はいつでもワンクリックです。",
				},
			},
		},
		finalCta: "さあ、始めよう",
		footer: "© {{year}} Voice Party. ライアットゲームズとは提携していません。",
	},
	app: {
		subtitle: "リアルタイム・ボイスチャット",
	},
	join: {
		heading: "ボイスチャット",
		summonerId: "サモナー名",
		summonerIdPlaceholder: "名前を入力",
		gameId: "ゲームID",
		gameIdPlaceholder: "参加するゲームIDを入力",
		joinGame: "参加する",
	},
	session: {
		label: "セッション",
		connected: "音声接続中",
		connecting: "接続中",
		disconnected: "接続が切断されました",
		reconnecting: "再接続しています",
		reconnectingHint:
			"ネットワークの復帰を待っています。そのままお待ちください。",
		reconnect: "再接続",
		noiseSuppression: "ノイズ抑制",
		noiseSuppressionOn: "ノイズ抑制: ON",
		noiseSuppressionOff: "ノイズ抑制: OFF",
		volume: "{{name}} の受信音量",
		mute: "ミュート",
		unmute: "ミュート解除",
		muted: "ミュート中",
		muteName: "{{name}} をミュート",
		unmuteName: "{{name}} のミュートを解除",
		participants: "参加者 ({{n}}/5)",
		you: "(あなた)",
		status: {
			connecting: "接続中",
			connected: "接続済み",
			reconnecting: "再接続中",
			disconnected: "切断",
		},
	},
	errors: {
		idsRequired: "サモナー名とゲームIDを入力してください",
		joinFailed: "セッションへの参加に失敗しました",
		voiceConnectionFailed:
			"セッションには参加しましたが、音声接続に失敗しました（コンソール／認証情報を確認してください）",
		reconnectFailed: "再接続に失敗しました。もう一度お試しください。",
	},
	language: {
		label: "言語",
	},
};

export type TranslationResources = typeof ja;
