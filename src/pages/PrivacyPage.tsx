import { useTranslation } from "react-i18next";
import { LegalPage } from "./LegalPage";

export const PrivacyPage = () => {
	const { t } = useTranslation();
	return (
		<LegalPage
			title={t("legal.privacy.title")}
			intro={t("legal.privacy.intro")}
			sections={
				t("legal.privacy.sections", { returnObjects: true }) as unknown as {
					heading: string;
					body: string;
				}[]
			}
		/>
	);
};
