# Cover Photos — yahan apni novel covers rakhein

Is folder me har novel ki **cover photo** aati hai. App khud in ko utha
lega — aap ko sirf sahi naam se photo yahan rakhni hai.

## Naam ka tareeqa (bohat zaroori)

Har photo ka naam us novel ki **id** ke barabar hona chahiye:

| Novel (title)                         | id | Photo ka naam |
|---------------------------------------|----|---------------|
| Namal                                 | 1  | `1.jpg`       |
| Mirat Ul Uroos                        | 2  | `2.jpg`       |
| Sarkash                               | 3  | `3.jpg`       |
| Peer e Kamil                          | 4  | `4.jpg`       |
| Raja Gidh                             | 5  | `5.jpg`       |
| Udaas Naslain                         | 6  | `6.jpg`       |
| Safreena                              | 7  | `7.jpg`       |
| Manto's 100 Best Short Stories        | 8  | `8.jpg`       |
| Hijaz Ki Aandhi                       | 9  | `9.jpg`       |
| Lazzat-e-Sang                         | 10 | `10.jpg`      |
| 1947 Ke Mazalim Ki Kahani             | 11 | `11.jpg`      |
| Pyar ka Pehla Shehar                  | 12 | `12.jpg`      |

> (id ↔ novel ka mapping `src/data/novels.js` me har novel ke upar likha hai.)

## 2 asaan steps

1. **Photo yahan copy karein** — is `assets/covers/` folder me, upar table
   wale naam ke saath. Misaal: novel id 1 ke liye `1.jpg`.

2. **`src/data/novels.js` kholein** aur us novel ki line jahan likha hai:

   ```js
   cover: null, // id 1 — apni photo: cover: require('../../assets/covers/1.jpg')
   ```

   ko is tarah badal dein:

   ```js
   cover: require('../../assets/covers/1.jpg'),
   ```

   Bas! Photo cover me lag jayegi.

## Zaroori baatein

- **JPG ya PNG** dono chalega. (Naam me extension photo ke hisaab se rakhein —
  agar PNG hai to `1.png` aur `require` me bhi `1.png`.)
- **Best size:** taqreeban **600 × 860 px**, portrait (khadi) shape. Chhoti
  photo dhundli lag sakti hai, bohat bari file app ka size barha degi.
- `require()` sirf **usi** file par lagayein jo waqai yahan mojood ho. Agar
  file mojood na ho to app build **error** de ga.
- Jis novel ki photo abhi na ho, us ki line ko `cover: null,` hi rehne dein —
  us par app ek saaf gradient placeholder (bina naam ke) dikha dega.

---
*Yeh folder Git me khali bhi push ho sake is liye `.gitkeep` rakha gaya hai —
use delete karne ki zaroorat nahi.*
