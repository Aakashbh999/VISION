import { itFieldsData } from "../data/itFieldsData";
import ITFieldCard from "../components/ui/ITFieldCard";
import CategoryPage from "../components/templates/CategoryPage";

const ITFields = () => (
  <CategoryPage
    title="Explore IT Career Fields"
    description="Discover structured information about different IT domains, their demand level, required skills, and career opportunities to make an informed decision."
    data={itFieldsData}
    CardComponent={ITFieldCard}
    filterKey="demand"
    filterOptions={["All", "High", "Medium", "Low"]}
  />
);

export default ITFields;
