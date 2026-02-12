import { jobsData } from "../data/jobsData"; // you'll create this
import JobCard from "../components/ui/JobCard";
import CategoryPage from "../components/templates/CategoryPage";

const ITJobs = () => (
  <CategoryPage
    title="IT Job Market in Nepal"
    description="Explore current job opportunities, demand levels, salary ranges, and top employers in Nepal's IT industry."
    data={jobsData}
    CardComponent={JobCard}
    filterKey="demand"
    filterOptions={["All", "High", "Medium", "Low"]}
  />
);

export default ITJobs;
