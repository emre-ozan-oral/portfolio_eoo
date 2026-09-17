// Small curated word pools, one per length, for Wend puzzle generation.
// Kept short and common on purpose — the puzzle should feel gettable.

export const WORDS_BY_LENGTH: Record<number, string[]> = {
  3: [
    "CAT", "DOG", "SUN", "SEA", "OAK", "RUN", "MAP", "TEA", "ICE", "BEE",
    "OWL", "FOX", "PEN", "KEY", "JAM", "LOG", "WEB", "TOY", "BUS", "CAR",
    "HAT", "BOX", "CUP", "FAN", "GEM", "INK", "JAR", "KIT", "LID", "MUD",
  ],
  4: [
    "BOOK", "MOON", "STAR", "FISH", "LAMP", "TREE", "DESK", "BELL", "WIND",
    "SNOW", "LEAF", "GATE", "NEST", "ROPE", "SALT", "SOAP", "VASE", "WOLF",
    "DUCK", "FROG", "GOLD", "HERO", "IRON", "JADE", "KING", "LAKE", "MILK",
    "NOTE", "OPAL",
  ],
  5: [
    "APPLE", "RIVER", "CLOUD", "BRAVE", "CANDY", "EAGLE", "FLAME", "GRAPE",
    "HONEY", "IVORY", "JOLLY", "KOALA", "LEMON", "MANGO", "NOBLE", "OCEAN",
    "PIANO", "QUEEN", "ROBOT", "SUGAR", "TIGER", "VIOLA", "WHALE", "YOUTH",
    "ZEBRA", "BREAD", "CHESS", "DANCE",
  ],
  6: [
    "GARDEN", "PLANET", "SILVER", "WINTER", "CASTLE", "DRAGON", "FOREST",
    "GUITAR", "HAMMER", "ISLAND", "JACKET", "KETTLE", "MEADOW", "MARBLE",
    "NATURE", "ORANGE", "PENCIL", "RABBIT", "SUNSET", "TUNNEL", "VOYAGE",
    "WALNUT", "YELLOW", "ZODIAC",
  ],
  7: [
    "AIRPORT", "BALCONY", "CABINET", "DIAMOND", "GALLERY", "HARVEST",
    "JOURNEY", "KITCHEN", "LIBRARY", "MONSTER", "NETWORK", "ORCHARD",
    "PICTURE", "RAINBOW", "VICTORY", "WEATHER", "TEACHER", "STUDENT",
    "COMPANY", "CAPTAIN", "CHICKEN", "CRYSTAL", "FREEDOM",
  ],
};
