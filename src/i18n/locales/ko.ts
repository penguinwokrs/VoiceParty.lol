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
		footer: "© {{year}} Voice Party.",
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
		share: "링크 복사",
		shareOnX: "X에 공유",
		linkCopied: "링크를 복사했습니다",
		shareText:
			"🎮 VoiceParty.lol에서 음성 채팅하며 놀고 있어요! 이 링크로 같이 놀아요 👉",
		noiseSuppression: "노이즈 억제",
		noiseSuppressionOn: "노이즈 억제: 켜짐",
		noiseSuppressionOff: "노이즈 억제: 꺼짐",
		volume: "{{name}} 볼륨",
		mute: "음소거",
		unmute: "음소거 해제",
		muted: "음소거됨",
		muteName: "{{name}} 음소거",
		unmuteName: "{{name}} 음소거 해제",
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
		reconnectFailed: "다시 연결하지 못했습니다. 다시 시도해 주세요.",
	},
	language: {
		label: "언어",
	},
	report: {
		action: "신고",
		title: "신고 사유",
		reportName: "{{name}} 신고",
		submitted: "신고하고 음소거했습니다",
		reasons: {
			harassment: "괴롭힘・민폐 행위",
			hate: "혐오・차별",
			spam: "스팸",
			inappropriate_name: "부적절한 이름",
			illegal: "위법・치트",
			other: "기타",
		},
	},
	legal: {
		disclaimer:
			"VoiceParty.lol isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.",
		updated: "최종 업데이트: 2026년 7월 16일",
		draftNote: "본 문서는 초안이며, 공개 전에 최종 확인을 거칩니다.",
		nav: {
			home: "홈",
			privacy: "개인정보 처리방침",
			terms: "이용약관",
		},
		privacy: {
			title: "개인정보 처리방침",
			intro:
				'본 방침은 VoiceParty.lol(이하 "본 서비스")의 개인정보 취급에 대해 규정합니다. 운영자 소재지인 일본의 개인정보보호법(APPI)을 기준으로 하며, 유럽(GDPR) 및 미국 캘리포니아주(CCPA) 이용자도 배려합니다.',
			sections: [
				{
					heading: "1. 수집하는 정보와 이용 목적",
					body: "본 서비스는 다음 정보를 취급합니다.\n・Riot ID／소환사 이름: 본인 식별 및 표시를 위해(이용자가 입력, 또는 향후 Riot Sign-On 연동으로 취득).\n・프로필 아이콘: 표시를 위해(Data Dragon의 공개 정보).\n・IP 주소・국가／지역: 전송 및 부정 방지를 위해(Cloudflare 경유).\n・세션 데이터: 음성 방 관리를 위해.\n・단말의 로컬 저장(localStorage): 볼륨・음소거・노이즈 억제 등 기능 설정을 위해.",
				},
				{
					heading: "2. 음성의 취급",
					body: "통화 중 음성은 WebRTC를 통해 참가자 간에 실시간으로 전송됩니다. 본 서비스는 음성을 녹음・저장하지 않습니다.",
				},
				{
					heading: "3. 쿠키・접속 분석",
					body: "본 서비스는 자체적으로 추적 목적의 쿠키를 사용하지 않습니다. 이용 현황 파악에는 cookieless 접속 분석을 사용하며, 프로덕트 지표는 식별자를 해시화하여 집계합니다. localStorage는 기능 목적으로만 사용합니다.",
				},
				{
					heading: "4. 광고・제휴(어필리에이트)",
					body: "본 서비스는 운영 비용 충당을 위해 제3자 광고 및 제3자 제휴 링크를 게재할 수 있습니다. 게재 시 해당 표시가 광고임을 명확히 표시합니다(일본 경품표시법의 스텔스 마케팅 규제에 근거). 제3자 광고 사업자가 쿠키 등으로 정보를 취득할 수 있으며, 그 취급은 각 사업자의 개인정보 방침을 따릅니다.",
				},
				{
					heading: "5. 제3자 제공・위탁처",
					body: "본 서비스는 기능 제공을 위해 다음 사업자에 정보 취급을 위탁합니다.\n・Cloudflare, Inc.(호스팅・전송・접속 분석)\n・RealtimeKit / Cloudflare(음성 통화 기반)\n・Riot Games, Inc.(Riot ID 등 검증 API)\n・광고・제휴 사업자(도입하는 경우)\n법령에 근거한 경우를 제외하고, 본인의 동의 없이 제3자에게 개인정보를 제공하지 않습니다.",
				},
				{
					heading: "6. 국외 이전",
					body: "상기 위탁에 따라 정보가 일본 국외의 서버에서 처리될 수 있습니다.",
				},
				{
					heading: "7. 보유 기간",
					body: "통화 세션에 관한 데이터는 일정 시간(기본 6시간) 후 자동으로 만료됩니다. 음성은 저장하지 않습니다. 접속 분석은 해시화・집계된 형식으로 보유합니다.",
				},
				{
					heading: "8. 이용자의 권리",
					body: "이용자는 자신의 개인정보에 대해 공개・정정・삭제・이용정지 등을 청구할 수 있습니다. 유럽 이용자는 GDPR에 근거한 권리를, 캘리포니아주 이용자는 CCPA에 근거한 옵트아웃 등을 행사할 수 있습니다. 청구는 말미의 문의 창구로 연락해 주십시오.",
				},
				{
					heading: "9. 미성년자",
					body: "본 서비스 이용에는 만 13세 이상이어야 합니다. 자세한 내용은 이용약관에 정합니다.",
				},
				{
					heading: "10. 본 방침의 개정",
					body: "본 방침은 필요에 따라 개정합니다. 중요한 변경은 본 서비스에서 공지합니다.",
				},
				{
					heading: "11. 문의",
					body: "개인정보 취급에 관한 문의는 본 서비스의 운영자에게 연락해 주십시오(연락처는 공개 시 기재합니다).",
				},
			],
		},
		terms: {
			title: "이용약관",
			intro:
				'본 이용약관(이하 "본 약관")은 VoiceParty.lol(이하 "본 서비스")의 이용 조건을 정합니다. 이용자는 본 약관에 동의한 후 본 서비스를 이용하는 것으로 합니다.',
			sections: [
				{
					heading: "1. 적용",
					body: "본 약관은 본 서비스 이용에 관한 운영자와 이용자 간의 모든 관계에 적용됩니다.",
				},
				{
					heading: "2. 이용 자격・연령",
					body: "본 서비스 이용에는 만 13세 이상이어야 합니다. 미성년자는 보호자의 동의를 얻은 후 이용해 주십시오.",
				},
				{
					heading: "3. 식별 정보",
					body: "이용자는 Riot ID／소환사 이름 등을 정확히 입력해야 하며, 타인을 사칭해서는 안 됩니다. 공유 URL(게임 ID)의 관리는 이용자의 책임으로 합니다.",
				},
				{
					heading: "4. 금지 사항",
					body: "이용자는 다음 행위를 해서는 안 됩니다.\n・괴롭힘, 협박, 시비\n・차별적・모욕적 언동, 혐오 발언\n・위법한 정보의 송신, 범죄를 조장하는 행위\n・타인의 개인정보 폭로(도싱)\n・사칭, 스팸\n・본 서비스 또는 그 기반에 대한 리버스 엔지니어링, 부정 접근, 운영 방해\n・타인 또는 제3자의 권리를 침해하는 행위",
				},
				{
					heading: "5. 음성 통화와 자기 방어 수단",
					body: "본 서비스는 음성을 녹음・저장하지 않습니다. 이용자는 참가자별 음소거, 퇴장, 방 전환으로 자신을 보호할 수 있습니다. 부적절한 이용자를 만난 경우 문의 창구로 신고할 수 있습니다.",
				},
				{
					heading: "6. 광고・제휴(어필리에이트)",
					body: "본 서비스는 무상으로 제공되며, 그 운영 비용을 광고 및 제3자 제휴로 충당합니다. 본 서비스는 광고・제휴를 포함한 표시에 대해 그것이 광고임을 명확히 표시합니다. 광고주 및 외부 링크처의 내용・거래에 대해 본 서비스는 책임을 지지 않으며, 이용자와 광고주・링크처의 거래는 당사자 간에 완결됩니다.",
				},
				{
					heading: "7. 지적재산 및 Riot Games와의 관계",
					body: "본 서비스는 Riot Games, Inc.의 API・지적재산을 이용하는 제3자 애플리케이션이며, Riot Games와 제휴하지 않았고 공식 승인을 받지 않았습니다. Riot Games 및 관련된 모든 자산은 Riot Games, Inc.의 상표 또는 등록 상표입니다.",
				},
				{
					heading: "8. 면책・무보증",
					body: "본 서비스는 현 상태 그대로 제공되며, 가용성, 완전성, 특정 목적에의 적합성을 보증하지 않습니다.",
				},
				{
					heading: "9. 책임의 제한",
					body: "운영자는 법령이 허용하는 범위에서 본 서비스의 이용 또는 이용 불능으로 인해 발생하는 손해에 대해 책임을 지지 않습니다.",
				},
				{
					heading: "10. 서비스의 변경・중단",
					body: "운영자는 이용자에 대한 사전 통지 없이 본 서비스의 내용을 변경하거나 제공을 중단・종료할 수 있습니다.",
				},
				{
					heading: "11. 약관의 변경",
					body: "운영자는 본 약관을 변경할 수 있습니다. 중요한 변경은 본 서비스에서 공지합니다. 변경 후 본 서비스의 이용으로써 변경에 동의한 것으로 간주합니다.",
				},
				{
					heading: "12. 준거법・관할",
					body: "본 약관은 일본법을 준거법으로 하며, 본 서비스에 관하여 분쟁이 발생한 경우 운영자 소재지를 관할하는 법원을 제1심의 전속적 합의 관할 법원으로 합니다.",
				},
				{
					heading: "13. 문의",
					body: "본 약관에 관한 문의는 본 서비스의 운영자에게 연락해 주십시오(연락처는 공개 시 기재합니다).",
				},
			],
		},
	},
};
