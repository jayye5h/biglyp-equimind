/* Soothing sounds — adapted from MindMelo (MIT, © 2023 Siddharth Talesara, github.com/sid-talesara/mindmelo). */
import { BsFillCloudRainFill, BsFillTrainFrontFill, BsFillMoonStarsFill, BsCodeSlash } from "react-icons/bs";
import { MdForest, MdLocalCafe } from "react-icons/md";
import { FaGuitar } from "react-icons/fa";
import { ImBooks } from "react-icons/im";
import { TbBowl } from "react-icons/tb";
import { IoIosThunderstorm } from "react-icons/io";
import { GiHummingbird, GiCampfire, GiBigWave, GiMeditation, GiFlute } from "react-icons/gi";

// 6-minute looping clips stored in the app (public/sounds), cut from the original jukehost.co.uk tracks
const A = (id) => `${process.env.PUBLIC_URL || ""}/sounds/${id}.mp3`;
const Y = (id) => `https://www.youtube.com/embed/${id}`;

export const SOUNDS = [
  { id: "guitar", name: "Guitar", icon: FaGuitar, audio: A("guitar"), link: Y("foIPN-T7RGo"), source: "Marco Cirillo",
    title: "Emotional Guitar Instrumentals (Relaxing, Romantic, Calming)",
    desc: "Gentle, emotional guitar instrumentals that create a tranquil atmosphere — for winding down after a long day or a soft creative boost while you focus.",
    tags: ["Guitar Instrumentals", "Relaxation", "Inspiration", "Tranquil Vibes", "Productivity"] },
  { id: "birds", name: "Birds", icon: GiHummingbird, audio: A("birds"), link: Y("2ETObczROVE"), source: "Wildlife World",
    title: "Nightingale Singing",
    desc: "The thrush nightingale (Luscinia luscinia) filling the air with its trills — a natural backdrop that helps you step away from the rush of the day.",
    tags: ["Bird Songs", "Thrush Nightingale", "Relaxation", "Meditation", "Focus"] },
  { id: "night", name: "Night", icon: BsFillMoonStarsFill, audio: A("night"), link: Y("sNPP0TtPT9A"), source: "George Vlad",
    title: "Nature and wildlife sounds — night in a remote African forest",
    desc: "Crickets and cicadas by the River Gambia in Niokolo-Koba National Park, Senegal, with distant baboons — a calm night chorus to unwind or meditate to.",
    tags: ["Nature Sounds", "Wildlife Ambience", "African Forest", "Relaxation", "Meditation"] },
  { id: "flute", name: "Flute", icon: GiFlute, audio: A("flute"), link: Y("53WVdC6IUjA"), source: "Meditative Mind",
    title: "Soul Alignment | Indian Flute Meditation Music @528Hz",
    desc: "Raag Bihag on the Indian flute, tuned to 528Hz — an evening companion for meditation, yoga or simply winding down.",
    tags: ["Indian Flute Meditation", "528Hz", "Deep Relaxation", "Yoga Practice"] },
  { id: "train", name: "Train", icon: BsFillTrainFrontFill, audio: A("train"), link: Y("MdgJC9kxeJI"), source: "Its AP The Rail Mania",
    title: "Relaxing Train Journey Sounds — Indian Railways",
    desc: "The steady rhythm of wheels on track along the Subramania Road – Mangaluru section — a gentle, familiar sound to settle into.",
    tags: ["Train Sound", "Indian Railways", "Soothing Journey"] },
  { id: "study", name: "Study", icon: ImBooks, audio: A("study"), link: Y("lTRiuFIWV54"), source: "Lofi Girl",
    title: "1 A.M Study Session — lofi hip hop / chill beats",
    desc: "Soft lofi hip hop and chill beats to keep you company while you read, write or work through assignments.",
    tags: ["Lofi Hip Hop", "Chill Beats", "Study Music", "Concentration"] },
  { id: "code", name: "Code", icon: BsCodeSlash, audio: A("code"), link: Y("f02mOEt11OQ"), source: "The AMP Channel",
    title: "code-fi / lofi beats to code & relax to",
    desc: "A mellow lofi mix for long coding or problem-solving sessions — steady, unobtrusive and easy to get into flow with.",
    tags: ["Lofi Beats", "Coding Music", "Relaxation", "Productivity"] },
  { id: "meditation", name: "Meditation", icon: GiMeditation, audio: A("meditation"), link: Y("cptgCNWO8Ro"), source: "Meditative Mind",
    title: "OM Chanting at 639Hz | Heart Chakra Chant",
    desc: "Slow, resonant OM chanting — a soothing, steady vibration to breathe along with and quiet the mind.",
    tags: ["OM Chanting", "Relaxation", "Meditation", "Mantra"] },
  { id: "singing-bowl", name: "Singing Bowl", icon: TbBowl, audio: A("singing-bowl"), link: Y("yEP2YrD-dyY"), source: "Meditative Mind",
    title: "Big Tibetan Singing Bowl Music for Healing & Meditation",
    desc: "Resonant Tibetan singing bowls tuned to 528Hz — long, gentle tones that invite deep relaxation and inner calm.",
    tags: ["Tibetan Singing Bowl", "Relaxation", "Meditation", "Inner Peace"] },
  { id: "cafe", name: "Cafe", icon: MdLocalCafe, audio: A("cafe"), link: Y("bctWQxhOfG4"), source: "Nomadic Ambience",
    title: "Montreal Cafe Ambience (binaural)",
    desc: "Clinking cups, espresso machines and hushed French conversation from Crew Cafe, Montreal — a cosy background for study and focus.",
    tags: ["Cafe Ambience", "Studying", "Focus", "Concentration"] },
  { id: "waves", name: "Waves", icon: GiBigWave, audio: A("waves"), link: Y("i7ds-DhM89I"), source: "George Vlad",
    title: "Ocean waves on a sandy beach in Madagascar",
    desc: "The slow ebb and flow of waves on a quiet beach — a calm, rhythmic sound to breathe with or drift off to.",
    tags: ["Ocean Waves", "Sandy Beach", "Focus", "Relaxation"] },
  { id: "campfire", name: "Campfire", icon: GiCampfire, audio: A("campfire"), link: Y("3DD4pgL5bS4"), source: "Epidemic Ambience",
    title: "Relaxing Fire Sounds — Fireplace & Bonfire",
    desc: "Soft crackling and hissing flames — a warm, cosy sound for quiet reflection or a gentle evening.",
    tags: ["Bonfire", "Nature", "Relaxation", "Tranquility"] },
  { id: "rain", name: "Rain", icon: BsFillCloudRainFill, audio: A("rain"), link: Y("0uAdrI6JpeY"), source: "George Vlad",
    title: "Calm rain in the Amazon jungle",
    desc: "Raindrops on leaves with the distant murmur of the rainforest — a peaceful sound for rest, study or sleep.",
    tags: ["Rain", "Jungle", "Study", "Relaxation"] },
  { id: "forest", name: "Forest", icon: MdForest, audio: A("forest"), link: Y("WFBVtn6BAc8"), source: "George Vlad",
    title: "Calm dawn chorus in the African savanna",
    desc: "Sunrise over the Kapamba River in South Luangwa, Zambia — birdsong, rustling bush and a distant hippo.",
    tags: ["Animals", "Nature", "Study", "Relaxation"] },
  { id: "thunderstorm", name: "Thunderstorm", icon: IoIosThunderstorm, audio: A("thunderstorm"), link: Y("y615vOsiG5w"), source: "Epidemic Ambience",
    title: "Rain and Thunderstorm Sounds for Focus, Relaxing and Sleep",
    desc: "Steady rain with distant rolling thunder — a deep, enveloping sound for focus, unwinding or falling asleep.",
    tags: ["Rain", "Night", "Sleeping", "Ambient", "Relaxation"] },
];

export const RELAX_BG = "https://images.unsplash.com/photo-1615472768508-9db82090f4c6?crop=entropy&cs=srgb&fm=jpg&q=80&w=2000";
