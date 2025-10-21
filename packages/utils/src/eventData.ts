const eventData = {
  eventName: "Lacho & Krisi's Wedding",
  date: "2026-06-27",
  time: "19:00",
  tz: "Europe/Sofia",
  location: {
    city: "Plovdiv, Bulgaria",
    venue: "Collibri Pool and Garden Plovdiv",
    address: "86, 4015 Plovdiv",
    gps: [42.1142642, 24.6800456],
    plus: "4M7J+P2 Plovdiv",
    mapsUrl: "https://maps.app.goo.gl/1oNjBBZuN5KeNdg18",
    iframeUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2959.6827823027866!2d24.677470676529946!3d42.11426417121689!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14accf38dbc987e5%3A0xc54b69e5ef55fba1!2sColibri%20Pool%20Plovdiv!5e0!3m2!1sen!2sbg!4v1761031201420!5m2!1sen!2sbg",
  },
  contactEmails: ["ltsochev@live.com", "krisi.v.kostova@gmail.com"],
  contactPhone: "+359897498226",
  website: "https://svatba2026.com",
  dressCode: "Formal",
  parking: "Available at venue",
  notes: "Please arrive 15 minutes early",
  links: {
    guests: "/api/users",
    tables: "/api/tables",
    weather: "/api/weather",
  },
} as const;

export default eventData;
