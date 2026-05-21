# Talon tiedot — viimeistely tuotedokumentin mukaan

PDF:n `talon_tiedot`-skeema (s. 10–11) vahvistaa nykyiset muutokset:
lämmitys = `lammitys` + `lammitys_vuosi` + `lammitys_malli` (ei tehoa/sarjanumeroa/varaajaa) ja sähköille/viemärille ei ole erillisiä "uusittu"-sarakkeita. Nämä on jo tehty.

Kaksi puuttuvaa kohtaa dokumentista:

## 1. Ilmalämpöpumppu **lisälaitteena**

Dokumentti määrittelee erilliset kentät `ilp_vuosi` ja `ilp_malli` – ilmalämpöpumppu voi olla talossa **päälämmitysmuodon lisäksi** (esim. öljylämmitys + ILP tukena). Nyt ILP näkyy vain jos se on valittu pää­lämmitykseksi.

**Toteutus:**
- Migration: lisää `talon_tiedot`-tauluun `ilp_merkki text`, `ilp_malli text`, `ilp_asennettu_vuosi int`.
- Lomake (teknisten alle oma kortti): "Ilmalämpöpumppu (lisälaite)" – merkki (SelectOrOther: Mitsubishi/Daikin/Panasonic/Toshiba/Fujitsu/LG/Samsung/Sharp/Muu), malli, asennusvuosi. Näytetään aina, ei riippuvainen päälämmitysmuodosta.
- Zod-skeema + save-payload päivitys `kotivahti.functions.ts` ja `talon-tiedot.tsx`.

## 2. Kiinteistön tyyppi -valinta perustietoihin

Doc s. 10: `kiinteistot.tyyppi` = omakotitalo / paritalo / rivitalo / mökki. Sarake on jo olemassa (oletus `omakotitalo`), mutta lomakkeella ei ole valintaa.

**Toteutus:**
- Perustiedot-välilehdelle Select: omakotitalo / paritalo / rivitalo / mökki.
- Talletetaan `kiinteistot.tyyppi`-sarakkeeseen (jo skeemassa, vain payload + UI).

## Mitä EI muuteta nyt

- IV-kentät (`ilmanvaihto`, `ilmanvaihto_vuosi`) toimivat dokumentin `iv_tyyppi/iv_vuosi`-kenttiä vastaavasti – jätetään ennalleen.
- Kattotyyppi/julkisivu/rakennustapa ovat lomakkeen lisätietoja (doc tallentaa loput `data` jsonb:hen) – pidetään omat sarakkeet ennallaan.
- Monikiinteistö-valitsin topbariin (doc s. 9) on oma laajempi työ, ei tähän.
