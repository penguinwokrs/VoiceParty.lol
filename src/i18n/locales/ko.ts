import type { TranslationResources } from "./ja";

export const ko: TranslationResources = {
	landing: {
		eyebrow: "실시간 음성",
		title: "Voice Party",
		subtitle:
			"동료를 모으고 전략을 맞추며, 선명한 음성으로 협곡을 지배하세요. 모든 것이 브라우저만으로 완결됩니다.",
		cta: "참가하기",
		scrollHint: "사용법",
		features: {
			eyebrow: "Why Voice Party",
			heading: "특징",
			items: {
				noInstall: {
					title: "설치 불필요",
					body: "브라우저만 있으면 OK. 앱 다운로드도 계정 등록도 필요 없습니다. 열자마자 바로 대화할 수 있습니다.",
				},
				clearVoice: {
					title: "선명한 음성",
					body: "저소음·고음질의 실시간 음성. 원탭으로 음소거를 전환할 수 있습니다.",
				},
				invite: {
					title: "링크로 즉시 초대",
					body: "게임 ID의 URL을 동료에게 공유하기만 하면 됩니다. 원클릭으로 같은 음성 채팅에 모일 수 있습니다.",
				},
				lowLatency: {
					title: "저지연·경량",
					body: "전 세계에 분산된 네트워크로 어디서나 지연이 적은 통화를 실현합니다.",
				},
			},
		},
		steps: {
			eyebrow: "How it works",
			heading: "사용법은 간단한 4단계",
			items: {
				enter: {
					title: "소환사 이름과 게임 ID 입력",
					body: "'참가'를 눌러 소환사 이름과 암호가 될 게임 ID를 입력합니다. ID는 동료와 맞추기만 하면 무엇이든 괜찮습니다.",
				},
				connect: {
					title: "음성 채팅에 연결",
					body: "'Join Game'을 누르면 마이크가 활성화되고, 같은 게임 ID의 동료와 음성으로 연결됩니다.",
				},
				share: {
					title: "URL을 동료에게 공유",
					body: "브라우저의 URL을 그대로 동료에게 보내기만 하면 됩니다. 받은 사람은 링크를 열면 같은 방에 참가할 수 있습니다.",
				},
				win: {
					title: "전략을 세워 승리로",
					body: "선명한 음성으로 협력하여 협곡을 제압하세요. 퇴장은 언제든지 원클릭입니다.",
				},
			},
		},
		finalCta: "자, 시작해요",
		footer: "© {{year}} Voice Party. 라이엇 게임즈와 제휴하지 않았습니다.",
	},
	app: {
		subtitle: "실시간 음성 채팅",
	},
	join: {
		heading: "음성 채팅",
		summonerId: "소환사 이름",
		summonerIdPlaceholder: "이름을 입력하세요",
		gameId: "게임 ID",
		gameIdPlaceholder: "참가할 게임 ID를 입력하세요",
		joinGame: "참가하기",
	},
	session: {
		label: "세션",
		connected: "음성 연결됨",
		connecting: "연결 중",
		disconnected: "연결이 끊겼습니다",
		reconnecting: "다시 연결하는 중",
		reconnectingHint:
			"네트워크 복구를 기다리고 있습니다. 잠시만 기다려 주세요.",
		reconnect: "다시 연결",
		participants: "참가자 ({{n}}/5)",
		you: "(나)",
		status: {
			connecting: "연결 중",
			connected: "연결됨",
			reconnecting: "재연결 중",
			disconnected: "연결 끊김",
		},
	},
	errors: {
		idsRequired: "소환사 이름과 게임 ID를 입력하세요",
		joinFailed: "세션 참가에 실패했습니다",
		voiceConnectionFailed:
			"세션에는 참가했지만 음성 연결에 실패했습니다 (콘솔/인증 정보를 확인하세요)",
	},
	language: {
		label: "언어",
	},
};
