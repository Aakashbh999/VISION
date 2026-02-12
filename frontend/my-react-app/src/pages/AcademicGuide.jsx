import { academicProgramsData } from "../data/academicProgramsData";
import AcademicProgramCard from "../components/ui/AcademicProgramCard";
import CategoryPage from "../components/templates/CategoryPage";

const AcademicGuide = () => (
  <CategoryPage
    title="Academic Guide: IT Programs in Nepal"
    description="Compare CSIT, BCA, BIT, and other IT degrees. Understand curriculum, duration, and university affiliations."
    data={academicProgramsData}
    CardComponent={AcademicProgramCard}
    filterKey="level"
    filterOptions={["All", "Bachelor", "Master", "Diploma"]}
  />
);

export default AcademicGuide;
