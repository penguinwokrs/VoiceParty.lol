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
		footer: "© {{year}} Voice Party.",
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
		share: "リンクをコピー",
		shareOnX: "X で共有",
		linkCopied: "リンクをコピーしました",
		shareText:
			"🎮 VoiceParty.lol でワイワイ通話しながら遊んでるよ！このリンクから合流してね👉",
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
	report: {
		action: "通報",
		title: "通報する理由",
		reportName: "{{name}} を通報",
		submitted: "通報し、ミュートしました",
		reasons: {
			harassment: "ハラスメント・迷惑行為",
			hate: "ヘイト・差別",
			spam: "スパム",
			inappropriate_name: "不適切な名前",
			illegal: "違法・チート",
			other: "その他",
		},
	},
	legal: {
		// Riot's required boilerplate is a legal notice kept in English across all
		// locales, as mandated by the Riot Developer Policies.
		disclaimer:
			"VoiceParty.lol isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.",
		updated: "最終更新日: 2026年7月16日",
		draftNote: "本文書はドラフトであり、公開前に最終確認を行います。",
		nav: {
			home: "ホーム",
			privacy: "プライバシーポリシー",
			terms: "利用規約",
		},
		privacy: {
			title: "プライバシーポリシー",
			intro:
				"VoiceParty.lol（以下「本サービス」）における個人情報の取扱いについて定めます。運営者所在地である日本の個人情報保護法を基準とし、欧州（GDPR）および米国カリフォルニア州（CCPA）の利用者にも配慮します。",
			sections: [
				{
					heading: "1. 取得する情報と利用目的",
					body: "本サービスは次の情報を取り扱います。\n・Riot ID／サモナー名: 本人の識別および表示のため（利用者が入力、または将来の Riot Sign-On 連携で取得）。\n・プロフィールアイコン: 表示のため（Data Dragon の公開情報）。\n・IP アドレス・国／地域: 配信および不正防止のため（Cloudflare 経由）。\n・セッションデータ: 通話ルームの管理のため。\n・端末のローカル保存（localStorage）: 音量・ミュート・ノイズ抑制などの機能設定のため。",
				},
				{
					heading: "2. 音声の取扱い",
					body: "通話中の音声は WebRTC により参加者間へリアルタイムで伝送されます。本サービスは音声を録音・保存しません。",
				},
				{
					heading: "3. Cookie・アクセス解析",
					body: "本サービスは自ら追跡目的の Cookie を使用しません。利用状況の把握には cookieless のアクセス解析を用い、プロダクト指標は識別子をハッシュ化して集計します。localStorage は機能目的に限り使用します。",
				},
				{
					heading: "4. 広告・アフィリエイト",
					body: "本サービスは運営費用を賄うため、第三者の広告および第三者アフィリエイトのリンクを掲載することがあります。これらを掲載する場合、当該表示が広告である旨を明確に表示します（景品表示法のステルスマーケティング規制に基づく）。第三者の広告事業者が Cookie 等により情報を取得することがあり、その取扱いは各事業者のプライバシーポリシーに従います。",
				},
				{
					heading: "5. 第三者への提供・委託先",
					body: "本サービスは、機能提供のため次の事業者に情報の取扱いを委託します。\n・Cloudflare, Inc.（ホスティング・配信・アクセス解析）\n・RealtimeKit / Cloudflare（音声通話基盤）\n・Riot Games, Inc.（Riot ID 等の検証 API）\n・広告・アフィリエイト事業者（導入する場合）\n法令に基づく場合を除き、本人の同意なく第三者へ個人情報を提供しません。",
				},
				{
					heading: "6. 国外への移転",
					body: "上記委託に伴い、情報が日本国外のサーバーで処理されることがあります。",
				},
				{
					heading: "7. 保持期間",
					body: "通話セッションに関するデータは一定時間（既定 6 時間）で自動的に失効します。音声は保存しません。アクセス解析はハッシュ化・集計された形式で保持します。",
				},
				{
					heading: "8. 利用者の権利",
					body: "利用者は、自己の個人情報について開示・訂正・削除・利用停止等を請求できます。欧州の利用者は GDPR に基づく諸権利を、カリフォルニア州の利用者は CCPA に基づくオプトアウト等を行使できます。請求は末尾のお問い合わせ窓口までご連絡ください。",
				},
				{
					heading: "9. 未成年者",
					body: "本サービスの利用には 13 歳以上であることが必要です。詳細は利用規約に定めます。",
				},
				{
					heading: "10. 本ポリシーの改定",
					body: "本ポリシーは必要に応じて改定します。重要な変更は本サービス上で告知します。",
				},
				{
					heading: "11. お問い合わせ",
					body: "個人情報の取扱いに関するお問い合わせは、本サービスの運営者までご連絡ください（連絡先は公開時に記載します）。",
				},
			],
		},
		terms: {
			title: "利用規約",
			intro:
				"本利用規約（以下「本規約」）は、VoiceParty.lol（以下「本サービス」）の利用条件を定めるものです。利用者は本規約に同意のうえ本サービスを利用するものとします。",
			sections: [
				{
					heading: "1. 適用",
					body: "本規約は、本サービスの利用に関する運営者と利用者との間の一切の関係に適用されます。",
				},
				{
					heading: "2. 利用資格・年齢",
					body: "本サービスの利用には 13 歳以上であることが必要です。未成年者は保護者の同意を得たうえで利用してください。",
				},
				{
					heading: "3. 識別情報",
					body: "利用者は、Riot ID／サモナー名等を正確に入力するものとし、他者へのなりすましを行ってはなりません。共有 URL（ゲーム ID）の管理は利用者の責任とします。",
				},
				{
					heading: "4. 禁止事項",
					body: "利用者は次の行為を行ってはなりません。\n・ハラスメント、脅迫、いやがらせ\n・差別的・侮辱的な言動、ヘイトスピーチ\n・違法な情報の送信、犯罪を助長する行為\n・他者の個人情報の暴露（ドクシング）\n・なりすまし、スパム\n・本サービスまたはその基盤へのリバースエンジニアリング、不正アクセス、運営妨害\n・他者または第三者の権利を侵害する行為",
				},
				{
					heading: "5. 音声通話と自衛手段",
					body: "本サービスは音声を録音・保存しません。利用者は、参加者ごとのミュート、退出、ルーム切替により自衛できます。不適切な利用者に遭遇した場合はお問い合わせ窓口へ通報できます。",
				},
				{
					heading: "6. 広告・アフィリエイト",
					body: "本サービスは無償で提供され、その運営費用を広告および第三者アフィリエイトによって賄います。本サービスは、広告・アフィリエイトを含む表示について、それが広告である旨を明確に表示します。広告主および外部リンク先の内容・取引について本サービスは責任を負わず、利用者と広告主・リンク先との取引は当事者間で完結します。",
				},
				{
					heading: "7. 知的財産および Riot Games との関係",
					body: "本サービスは Riot Games, Inc. の API・知的財産を利用する第三者アプリケーションであり、Riot Games とは提携しておらず、公式の承認を受けたものではありません。Riot Games および関連する一切の資産は Riot Games, Inc. の商標または登録商標です。",
				},
				{
					heading: "8. 免責・無保証",
					body: "本サービスは現状有姿で提供され、可用性、完全性、特定目的への適合性を保証しません。",
				},
				{
					heading: "9. 責任の制限",
					body: "運営者は、法令で許容される範囲において、本サービスの利用または利用不能から生じる損害について責任を負いません。",
				},
				{
					heading: "10. サービスの変更・中断",
					body: "運営者は、利用者への事前通知なく、本サービスの内容を変更し、または提供を中断・終了することがあります。",
				},
				{
					heading: "11. 規約の変更",
					body: "運営者は本規約を変更することがあります。重要な変更は本サービス上で告知します。変更後の本サービスの利用をもって、変更に同意したものとみなします。",
				},
				{
					heading: "12. 準拠法・管轄",
					body: "本規約は日本法を準拠法とし、本サービスに関して紛争が生じた場合、運営者所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。",
				},
				{
					heading: "13. お問い合わせ",
					body: "本規約に関するお問い合わせは、本サービスの運営者までご連絡ください（連絡先は公開時に記載します）。",
				},
			],
		},
	},
};

export type TranslationResources = typeof ja;
