import Card from "../ui/Card";

const FeatureGrid = () => {
  const features = [
    {
      title: "Explore IT Fields",
      description:
        "Learn about different IT fields, required skills, and future scope.",
      icon: "🔍",
      color: "blue",
      link: "/it-fields",
      linkText: "Start exploring",
    },
    {
      title: "Academic Guide",
      description:
        "Compare CSIT, BCA, and BIT to choose the right academic path.",
      icon: "📚",
      color: "green",
      link: "/academic-guide",
      linkText: "Compare degrees",
    },
    {
      title: "IT Jobs & Market",
      description:
        "Understand job roles, demand, and industry expectations in Nepal.",
      icon: "💼",
      color: "orange",
      link: "/it-jobs",
      linkText: "Explore jobs",
    },
    {
      title: "Community & IT Clubs",
      description:
        "Discover clubs and communities to grow beyond the classroom.",
      icon: "👥",
      color: "purple",
      link: "/it-clubs",
      linkText: "Join community",
    },
  ];

  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {features.map((feature, index) => (
          <Card key={index} {...feature} />
        ))}
      </div>
    </section>
  );
};

export default FeatureGrid;
