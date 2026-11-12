export type GalleryPhoto = {
  src: string;
  alt: string;
  caption: string;
  position?: string;
};

const image = (name: string) => `/gallery/${name}`;

export const galleryPhotos: GalleryPhoto[] = [
  { src: image("homelab.png"), alt: "A mini PC used for Andre's homelab", caption: "the homelab, mid-sprawl" },
  { src: image("gundam.png"), alt: "A Gundam model", caption: "Gundam" },
  { src: image("alberta glacier.png"), alt: "A glacier in Alberta", caption: "Alberta glacier" },
  { src: image("alberta falls.png"), alt: "A waterfall in Alberta", caption: "Alberta falls" },
  { src: image("lake louise.png"), alt: "Lake Louise", caption: "Lake Louise" },
  { src: image("rice fields.png"), alt: "Rice fields", caption: "rice fields" },
  { src: image("jacks farm.png"), alt: "Jack's farm", caption: "Jack's farm" },
  { src: image("random cruise trip.png"), alt: "A cruise trip", caption: "random cruise trip" },
  { src: image("doggy.png"), alt: "Apollo", caption: "sad doggy" },
  { src: image("baby apollo.png"), alt: "Apollo as a puppy", caption: "baby Apollo" },
  { src: image("profile.webp"), alt: "Me scuba diving", caption: "somewhere underwater" },
  { src: image("random dog photo 1.png"), alt: "Apollo", caption: "random dog photo no. 1" },
  { src: image("random dog photo 2.png"), alt: "Apollo", caption: "random dog photo no. 2" },
  { src: image("other doggy in php.png"), alt: "Another dog in the Philippines", caption: "other doggy in the Philippines" },
  { src: image("too many toys ....png"), alt: "Apollo with many toys", caption: "too many toys" },
  { src: image("y u do dis to me.png"), alt: "Apollo", caption: "y u do dis to me" },
  { src: image("W php breakfast.png"), alt: "Breakfast in the Philippines", caption: "W Philippines breakfast" },
  { src: image("pho dac biet idk when.png"), alt: "A bowl of pho dac biet", caption: "phở đặc biệt, idk when" },
  { src: image("enchiladas.png"), alt: "Enchiladas", caption: "enchiladas" },
  { src: image("souper_2026_11_11.png"), alt: "Soup", caption: "souper" },
  { src: image("formal 1.png"), alt: "Andre dressed formally", caption: "formal 1" },
  { src: image("me and my sis.png"), alt: "Andre and his sister", caption: "me and my sis" },
  { src: image("last day at eccc.png"), alt: "Andre on his last day at ECCC", caption: "last day at ECCC" },
  { src: image("holy larp.png"), alt: "A LARP scene", caption: "holy LARP" },
  { src: image("pokerogue lol.png"), alt: "A PokéRogue game screen", caption: "pokerogue lol" },
  { src: image("big and strong SIR YES SIR.png"), alt: "A person looking big and strong", caption: "big and strong, SIR YES SIR" },
  { src: image("cala sa forcanera.png"), alt: "Cala Sa Forcanera", caption: "Cala Sa Forcanera" },
  { src: image("cool reflection.png"), alt: "A reflection", caption: "cool reflection" },
  { src: image("me and some friends.png"), alt: "Andre with some friends", caption: "me and some friends" },
  { src: image("montserrat.png"), alt: "Montserrat", caption: "Montserrat" },
  { src: image("popo ready to go to school.png"), alt: "Popo ready to go to school", caption: "Popo, ready to go to school" },
  { src: image("somewhere in pickering.png"), alt: "Somewhere in Pickering", caption: "somewhere in Pickering" },
  { src: image("you're the best part of today.png"), alt: "chick fil a best part of today", caption: "you’re the best part of today" },
];
