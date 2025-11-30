import { db } from '../firebase';
import { collection, writeBatch, getDocs, doc } from 'firebase/firestore';
import { Occasion } from '../types';

// This is the master list of occasions. It's kept here so it can be used to seed the database.
const ALL_OCCASIONS: Omit<Occasion, 'id'>[] = [
    // Featured
    { value: 'pride', label: 'Pride Month', category: 'Featured', tone: 'celebratory', color: '', imageUrl: 'https://images.unsplash.com/photo-1623824147340-5473e35a1a1f?q=80&w=800&auto=format&fit=crop', months: [5] },
    { value: 'bca', label: 'Breast Cancer Awareness', category: 'Featured', tone: 'supportive', color: '', imageUrl: 'https://images.unsplash.com/photo-1576426863848-c2b6fd3436a5?q=80&w=800&auto=format&fit=crop', months: [9] },
    { value: 'earth-day', label: 'Earth Day', category: 'Featured', tone: 'natural', color: '', imageUrl: 'https://images.unsplash.com/photo-1587880392374-24a954757c91?q=80&w=800&auto=format&fit=crop', months: [3] },
    { value: 'black-friday', label: 'Black Friday', category: 'Featured', tone: 'bold', color: '', imageUrl: 'https://images.unsplash.com/photo-1542317594-814277494867?q=80&w=800&auto=format&fit=crop', months: [10] },
    { value: 'new-year', label: 'New Year', category: 'Featured', tone: 'celebratory', color: '', imageUrl: 'https://images.unsplash.com/photo-1515942349339-06e141a31d9a?q=80&w=800&auto=format&fit=crop', months: [0, 11] },
    { value: 'halloween', label: 'Halloween', category: 'Featured', tone: 'fun', color: '', imageUrl: 'https://images.unsplash.com/photo-1572596019094-73459c39543e?q=80&w=800&auto=format&fit=crop', months: [9] },
    
    // Holidays
    { value: 'lunar-new-year', label: 'Lunar New Year', category: 'Holidays', tone: 'celebratory', color: '', imageUrl: 'https://images.unsplash.com/photo-1563720232950-89196d418728?q=80&w=800&auto=format&fit=crop', months: [0, 1] },
    { value: 'st-patricks', label: 'St. Patrick\'s Day', category: 'Holidays', tone: 'fun', color: '', imageUrl: 'https://images.unsplash.com/photo-1552523171-98a4a3422a57?q=80&w=800&auto=format&fit=crop', months: [2] },
    { value: 'valentines', label: 'Valentine\'s Day', category: 'Holidays', tone: 'spirited', color: '', imageUrl: 'https://images.unsplash.com/photo-1550426735-c33a0ce3914a?q=80&w=800&auto=format&fit=crop', months: [1] },
    { value: 'easter', label: 'Easter', category: 'Holidays', tone: 'celebratory', color: '', imageUrl: 'https://images.unsplash.com/photo-1585238342070-50e1c6e3c837?q=80&w=800&auto=format&fit=crop', months: [2, 3] },
    { value: 'ramadan', label: 'Ramadan', category: 'Holidays', tone: 'respectful', color: '', imageUrl: 'https://images.unsplash.com/photo-1587802525386-d33684aef535?q=80&w=800&auto=format&fit=crop', months: [2, 3, 4] },
    { value: 'christmas', label: 'Christmas', category: 'Holidays', tone: 'celebratory', color: '', imageUrl: 'https://images.unsplash.com/photo-1576017888373-65d981881a5c?q=80&w=800&auto=format&fit=crop', months: [11] },
    { value: 'thanksgiving', label: 'Thanksgiving', category: 'Holidays', tone: 'celebratory', color: '', imageUrl: 'https://images.unsplash.com/photo-1574936218635-c8728f152f55?q=80&w=800&auto=format&fit=crop', months: [10] },
    { value: 'hanukkah', label: 'Hanukkah', category: 'Holidays', tone: 'celebratory', color: '', imageUrl: 'https://images.unsplash.com/photo-1606757389658-000c2bf0d4e3?q=80&w=800&auto=format&fit=crop', months: [11] },
    { value: 'independence-day-us', label: 'Independence Day (US)', category: 'Holidays', tone: 'celebratory', color: '', imageUrl: 'https://images.unsplash.com/photo-1563209869-65b84a2a106a?q=80&w=800&auto=format&fit=crop', months: [6] },
    { value: 'diwali', label: 'Diwali', category: 'Holidays', tone: 'celebratory', color: '', imageUrl: 'https://images.unsplash.com/photo-1574108843343-a49a1170d44d?q=80&w=800&auto=format&fit=crop', months: [9, 10] },
    { value: 'kwanzaa', label: 'Kwanzaa', category: 'Holidays', tone: 'celebratory', color: '', imageUrl: 'https://images.unsplash.com/photo-1671911320302-e22d553f0814?q=80&w=800&auto=format&fit=crop', months: [11] },
    { value: 'holi', label: 'Holi', category: 'Holidays', tone: 'celebratory', color: '', imageUrl: 'https://images.unsplash.com/photo-1582902281862-2771253c1543?q=80&w=800&auto=format&fit=crop', months: [2] },
    { value: 'dia-de-los-muertos', label: 'Día de los Muertos', category: 'Holidays', tone: 'respectful', color: '', imageUrl: 'https://images.unsplash.com/photo-1604161831412-f1b218a594e9?q=80&w=800&auto=format&fit=crop', months: [10] },
    { value: 'mardi-gras', label: 'Mardi Gras', category: 'Holidays', tone: 'celebratory', color: '', imageUrl: 'https://images.unsplash.com/photo-1550977463-3cb4e7655973?q=80&w=800&auto=format&fit=crop', months: [1, 2] },
    { value: 'oktoberfest', label: 'Oktoberfest', category: 'Holidays', tone: 'celebratory', color: '', imageUrl: 'https://images.unsplash.com/photo-1569401132205-b28c0b2f5f9b?q=80&w=800&auto=format&fit=crop', months: [8, 9] },
    { value: 'canada-day', label: 'Canada Day', category: 'Holidays', tone: 'celebratory', color: '', imageUrl: 'https://images.unsplash.com/photo-1593028359092-294c7597e733?q=80&w=800&auto=format&fit=crop', months: [6] },
    { value: 'bastille-day', label: 'Bastille Day', category: 'Holidays', tone: 'celebratory', color: '', imageUrl: 'https://images.unsplash.com/photo-1594903335559-99a6e7c10b48?q=80&w=800&auto=format&fit=crop', months: [6] },

    // Awareness
    { value: 'mental-health', label: 'Mental Health', category: 'Awareness', tone: 'supportive', color: '', imageUrl: 'https://images.unsplash.com/photo-1590425297292-2f6336a1e505?q=80&w=800&auto=format&fit=crop', months: [4] },
    { value: 'autism-acceptance', label: 'Autism Acceptance', category: 'Awareness', tone: 'supportive', color: '', imageUrl: 'https://images.unsplash.com/photo-1599819777174-a6b5c39a3194?q=80&w=800&auto=format&fit=crop', months: [3] },
    { value: 'womens-history', label: 'Women\'s History', category: 'Awareness', tone: 'celebratory', color: '', imageUrl: 'https://images.unsplash.com/photo-1502452026-62d3a39e7631?q=80&w=800&auto=format&fit=crop', months: [2] },
    { value: 'black-history', label: 'Black History', category: 'Awareness', tone: 'celebratory', color: '', imageUrl: 'https://images.unsplash.com/photo-1614946394334-aa2a9c3d4e08?q=80&w=800&auto=format&fit=crop', months: [1] },
    { value: 'disability-pride', label: 'Disability Pride', category: 'Awareness', tone: 'celebratory', color: '', imageUrl: 'https://images.unsplash.com/photo-1623824147340-5473e35a1a1f?q=80&w=800&auto=format&fit=crop', months: [6] },
    { value: 'lgbtq-history', label: 'LGBTQ+ History Month', category: 'Awareness', tone: 'celebratory', color: '', imageUrl: 'https://images.unsplash.com/photo-1623824147340-5473e35a1a1f?q=80&w=800&auto=format&fit=crop', months: [9] },
    { value: 'intl-womens-day', label: 'International Women\'s Day', category: 'Awareness', tone: 'celebratory', color: '', imageUrl: 'https://images.unsplash.com/photo-1502452026-62d3a39e7631?q=80&w=800&auto=format&fit=crop', months: [2] },
    { value: 'world-mental-health-day', label: 'World Mental Health Day', category: 'Awareness', tone: 'supportive', color: '', imageUrl: 'https://images.unsplash.com/photo-1590425297292-2f6336a1e505?q=80&w=800&auto=format&fit=crop', months: [9] },
    { value: 'human-rights-day', label: 'Human Rights Day', category: 'Awareness', tone: 'supportive', color: '', imageUrl: 'https://images.unsplash.com/photo-1580983216279-d04b611e9bca?q=80&w=800&auto=format&fit=crop', months: [11] },

    // Commercial
    { value: 'cyber-monday', label: 'Cyber Monday', category: 'Commercial', tone: 'bold', color: '', imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=800&auto=format&fit=crop', months: [10] },
    { value: 'summer-sale', label: 'Summer Sale', category: 'Commercial', tone: 'fun', color: '', imageUrl: 'https://images.unsplash.com/photo-1563454944-8c7653702118?q=80&w=800&auto=format&fit=crop', months: [5, 6] },
    { value: 'back-to-school', label: 'Back to School', category: 'Commercial', tone: 'spirited', color: '', imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop', months: [7, 8] },
    { value: 'small-biz-saturday', label: 'Small Business Saturday', category: 'Commercial', tone: 'supportive', color: '', imageUrl: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=800&auto=format&fit=crop', months: [10] },
    { value: 'giving-tuesday', label: 'Giving Tuesday', category: 'Commercial', tone: 'supportive', color: '', imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop', months: [10] },

    // Seasonal
    { value: 'spring-renewal', label: 'Spring Renewal', category: 'Seasonal', tone: 'natural', color: '', imageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=800&auto=format&fit=crop', months: [2, 3, 4] },
    { value: 'autumn-fall', label: 'Autumn / Fall', category: 'Seasonal', tone: 'natural', color: '', imageUrl: 'https://images.unsplash.com/photo-1507502707542-a7a2a5a6a619?q=80&w=800&auto=format&fit=crop', months: [8, 9, 10] },
    { value: 'winter-holiday', label: 'Winter / Holiday', category: 'Seasonal', tone: 'celebratory', color: '', imageUrl: 'https://images.unsplash.com/photo-1544275217-c46420542152?q=80&w=800&auto=format&fit=crop', months: [11, 0, 1] },
    { value: 'summer-vibes', label: 'Summer Vibes', category: 'Seasonal', tone: 'fun', color: '', imageUrl: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=800&auto=format&fit=crop', months: [5, 6, 7] },

    // Heritage
    { value: 'hispanic-heritage', label: 'Hispanic Heritage', category: 'Heritage', tone: 'celebratory', color: '', imageUrl: 'https://images.unsplash.com/photo-1605334237274-32a24345d137?q=80&w=800&auto=format&fit=crop', months: [8, 9] },
    { value: 'aapi-heritage', label: 'AAPI Heritage', category: 'Heritage', tone: 'celebratory', color: '', imageUrl: 'https://images.unsplash.com/photo-1622691515589-91c6136d3536?q=80&w=800&auto=format&fit=crop', months: [4] },
    { value: 'native-american-heritage', label: 'Native American Heritage', category: 'Heritage', tone: 'respectful', color: '', imageUrl: 'https://images.unsplash.com/photo-1604514336291-1b0a505971a8?q=80&w=800&auto=format&fit=crop', months: [10] },
    { value: 'juneteenth', label: 'Juneteenth', category: 'Heritage', tone: 'celebratory', color: '', imageUrl: 'https://images.unsplash.com/photo-1624022822552-5a2b25f826a1?q=80&w=800&auto=format&fit=crop', months: [5] },
    { value: 'arab-american-heritage', label: 'Arab American Heritage', category: 'Heritage', tone: 'celebratory', color: '', imageUrl: 'https://images.unsplash.com/photo-1574509424855-3058c4278453?q=80&w=800&auto=format&fit=crop', months: [3] },
    { value: 'jewish-american-heritage', label: 'Jewish American Heritage', category: 'Heritage', tone: 'celebratory', color: '', imageUrl: 'https://images.unsplash.com/photo-1579482451034-8c01d44c6a9a?q=80&w=800&auto=format&fit=crop', months: [4] },
    
    // Health
    { value: 'heart-health', label: 'Heart Health', category: 'Health', tone: 'supportive', color: '', imageUrl: 'https://images.unsplash.com/photo-1560787313-5dff3307e257?q=80&w=800&auto=format&fit=crop', months: [1] },
    { value: 'world-aids-day', label: 'World AIDS Day', category: 'Health', tone: 'supportive', color: '', imageUrl: 'https://images.unsplash.com/photo-1623824147340-5473e35a1a1f?q=80&w=800&auto=format&fit=crop', months: [11] },
    { value: 'movember', label: 'Movember', category: 'Health', tone: 'fun', color: '', imageUrl: 'https://images.unsplash.com/photo-1566492025424-219c62a87c1c?q=80&w=800&auto=format&fit=crop', months: [10] },
];


export const seedOccasionsToFirestore = async (): Promise<void> => {
    const occasionsCol = collection(db, 'occasions');
    
    // Check if data already exists to prevent re-seeding
    const snapshot = await getDocs(occasionsCol);
    if (!snapshot.empty) {
        console.log("Occasions collection already exists. Skipping seed.");
        return;
    }

    const batch = writeBatch(db);

    ALL_OCCASIONS.forEach((occasion) => {
        // Correct v9+ syntax: create a new doc reference within the collection for each item
        const docRef = doc(collection(db, 'occasions')); 
        batch.set(docRef, occasion);
    });

    try {
        await batch.commit();
        console.log("Successfully seeded occasions to Firestore.");
    } catch (error) {
        console.error("Error seeding occasions to Firestore: ", error);
        throw error;
    }
};