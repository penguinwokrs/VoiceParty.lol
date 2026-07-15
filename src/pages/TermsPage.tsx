import { useTranslation } from "react-i18next";
import { LegalPage } from "./LegalPage";

export const TermsPage = () => {
	const { t } = useTranslation();
	return (
		<LegalPage
			title={t("legal.terms.title")}
			intro={t("legal.terms.intro")}
			sections={
				t("legal.terms.sections", { returnObjects: true }) as unknown as {
					heading: string;
					body: string;
				}[]
			}
		/>
	);
};
