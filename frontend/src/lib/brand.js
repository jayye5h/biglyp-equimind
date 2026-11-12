/** Programme branding. Both programmes share one engine and report format; only content, words and colours differ. */
export const BRANDS = {
  equimind: {
    key: "equimind", name: "EquiMind", tagline: "Student stress check-in", home: "/", login: "/login",
    audience: "university students", counsellor: "campus counsellor", counsellorTitle: "Campus counsellor",
    palettes: ["sky", "mint"], pdfPrefix: "EquiMind",
  },
  mindmellow: {
    key: "mindmellow", name: "MindMellow", tagline: "Wellbeing check-in for Grades 11–12", home: "/mindmellow", login: "/mindmellow/login",
    audience: "Class 11–12 students", counsellor: "school counsellor", counsellorTitle: "School counsellor",
    palettes: ["lavender", "peach", "teal"], pdfPrefix: "MindMellow",
  },
};
