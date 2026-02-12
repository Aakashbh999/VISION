import { clubsData } from "../data/clubsData";
import ClubCard from "../components/ui/ClubCard";
import CategoryPage from "../components/templates/CategoryPage";

const ITClubs = () => (
  <CategoryPage
    title="IT Clubs & Communities"
    description="Connect with student clubs, tech communities, and professional networks across Nepal."
    data={clubsData}
    CardComponent={ClubCard}
    filterKey="region"
    filterOptions={[
      "All",
      "Kathmandu",
      "Pokhara",
      "Lalitpur",
      "Bhaktapur",
      "Other",
    ]}
  />
);

export default ITClubs;
