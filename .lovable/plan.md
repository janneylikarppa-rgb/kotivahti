# Puuverhouksen maalausvuosi talon tietoihin

## Mitä jo on (ei muuteta)
- PTS-sääntö `julkisivu_puu_maalaus` (10 v välein) on jo määritelty `src/lib/pts-kohteet.ts:84` — laukeaa automaattisesti kun julkisivumateriaaliksi on valittu "puu/hirsi" ja `julkisivu_maalattu_vuosi` on tiedossa.
- PTS-näkymässä on jo "Pyydä kuntoarviota" -painike per rivi, joka avaa `LiidiDialog`in ja esitäyttää kohteen — tämä toimii automaattisesti myös puujulkisivun maalaukselle heti kun rivi näkyy.
- `julkisivu_maalattu_vuosi`-kenttä tallentuu jo `talon_tiedot`-tauluun.

Ei tarvita uusia tietokantakenttiä, uusia PTS-sääntöjä eikä uusia CTA-painikkeita.

## Muutos

### `src/routes/_authenticated/talon-tiedot.tsx` — ehdollinen maalausvuosi-kenttä
Rivit 330–333 (Rakennusmateriaalit-osio):

- "Julkisivu maalattu / huollettu (vuosi)" -kenttä näytetään **vain** kun valittu `julkisivumateriaali` sisältää "puu" tai "hirsi" (case-insensitive substring -tarkistus, sama logiikka kuin `pts-kohteet.ts`:n `onMat`-apurissa).
- Muille materiaaleille (tiili, rappaus, pelti, levy…) kenttä piilotetaan, jotta lomake pysyy selkeänä. "Julkisivun asennusvuosi" säilyy aina näkyvissä.
- Arvoa ei pyyhitä tietokannasta, jos käyttäjä vaihtaa materiaalia — vain UI piilottaa kentän.

Talon tiedot -näkymässä ei näytetä suosituksia tai CTA-painikkeita — kaikki suositukset ja tarjouspyyntö-toiminnot pysyvät PTS-sivulla.

## Hyväksymiskriteerit
- Kun käyttäjä valitsee julkisivumateriaaliksi "Puu (lautaverhous)" tai "Hirsi", "Maalattu (vuosi)" -kenttä ilmestyy.
- Kun materiaali on jokin muu, kenttää ei näytetä.
- PTS-sivulla "Puujulkisivun maalaus" -rivi ilmestyy automaattisesti syötetyn vuoden perusteella ja sieltä voi pyytää kuntoarvion/tarjouksen olemassa olevalla painikkeella.
