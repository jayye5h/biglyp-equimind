/** Programme branding. Both programmes share one engine and report format; only content, words and colours differ. */
export const BRANDS = {
  equimind: {
    key: "equimind", name: "EquiMind", tagline: "Student stress check-in", home: "/equimind", login: "/login",
    audience: "university students", counsellor: "campus counsellor", counsellorTitle: "Campus counsellor",
    palettes: ["sky", "mint"], pdfPrefix: "EquiMind", school: false,
  },
  mindmellow: {
    key: "mindmellow", name: "MindMellow", tagline: "Wellbeing check-in for Grades 11–12", home: "/mindmellow", login: "/mindmellow/login",
    audience: "Class 11–12 students", counsellor: "school counsellor", counsellorTitle: "School counsellor",
    palettes: ["lavender", "peach", "teal"], pdfPrefix: "MindMellow", school: true,
  },
  mindedge: {
    key: "mindedge", name: "MindEdge", tagline: "Wellbeing check-in for Grades 9–10", home: "/mindedge", login: "/mindedge/login",
    audience: "Class 9–10 students", counsellor: "school counsellor", counsellorTitle: "School counsellor",
    palettes: ["ocean", "seafoam", "palegold"], pdfPrefix: "MindEdge", school: true,
  },
  focusedge: {
    key: "focusedge", name: "FocusEdge", tagline: "Focus & study-habit check-in for Grades 6–8", home: "/focusedge", login: "/focusedge/login",
    audience: "Class 6–8 students", counsellor: "school counsellor", counsellorTitle: "School counsellor",
    palettes: ["indigo", "coral", "mintleaf"], pdfPrefix: "FocusEdge", school: true, focus: true, retakeDay: 14,
  },
};
/** Brand for a report / user programme (defaults to EquiMind). */
export const brandOf = (x) => BRANDS[x?.programme] || BRANDS.equimind;
