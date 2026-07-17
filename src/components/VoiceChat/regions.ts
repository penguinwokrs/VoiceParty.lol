// Riot platform routing regions (LoL).
//
// The region is part of a room's identity, not just a profile preference:
// players on different platforms cannot queue together, so an invite link that
// omits it can send someone to a room they could never actually play in. Hence
// `/join/:region/:sessionId` and the share URL both carry it.
//
// `code` is the platform value used by the Riot API; `label` is what the player
// picks from the suggestions.
export type Region = { code: string; label: string };

export const REGIONS: Region[] = [
	{ code: "na1", label: "North America (NA)" },
	{ code: "euw1", label: "EU West (EUW)" },
	{ code: "eun1", label: "EU Nordic & East (EUNE)" },
	{ code: "kr", label: "Korea (KR)" },
	{ code: "jp1", label: "Japan (JP)" },
	{ code: "oc1", label: "Oceania (OCE)" },
	{ code: "br1", label: "Brazil (BR)" },
	{ code: "la1", label: "Latin America North (LAN)" },
	{ code: "la2", label: "Latin America South (LAS)" },
	{ code: "tr1", label: "Türkiye (TR)" },
	{ code: "ru", label: "Russia (RU)" },
	{ code: "ph2", label: "Philippines (PH)" },
	{ code: "sg2", label: "Singapore (SG)" },
	{ code: "th2", label: "Thailand (TH)" },
	{ code: "tw2", label: "Taiwan (TW)" },
	{ code: "vn2", label: "Vietnam (VN)" },
];

const CODES = new Set(REGIONS.map((r) => r.code));

// Guards URL input: an unknown code must not be trusted as a region.
export const isRegionCode = (value: string | undefined): value is string =>
	!!value && CODES.has(value);

export const regionLabel = (code: string): string =>
	REGIONS.find((r) => r.code === code)?.label ?? code;
