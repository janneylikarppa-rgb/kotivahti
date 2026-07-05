export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ammattilaiset: {
        Row: {
          aktiivinen: boolean
          arviomaara: number
          created_at: string
          id: string
          kategoria: string
          keskiarvopisteet: number | null
          prioriteetti: number
          puhelin: string | null
          sahkoposti: string
          toimialueet: string[]
          updated_at: string
          viimeisin_arvio: string | null
          yritys: string
        }
        Insert: {
          aktiivinen?: boolean
          arviomaara?: number
          created_at?: string
          id?: string
          kategoria: string
          keskiarvopisteet?: number | null
          prioriteetti?: number
          puhelin?: string | null
          sahkoposti: string
          toimialueet?: string[]
          updated_at?: string
          viimeisin_arvio?: string | null
          yritys: string
        }
        Update: {
          aktiivinen?: boolean
          arviomaara?: number
          created_at?: string
          id?: string
          kategoria?: string
          keskiarvopisteet?: number | null
          prioriteetti?: number
          puhelin?: string | null
          sahkoposti?: string
          toimialueet?: string[]
          updated_at?: string
          viimeisin_arvio?: string | null
          yritys?: string
        }
        Relationships: []
      }
      huolto_historia: {
        Row: {
          created_at: string
          id: string
          kategoria: string | null
          kiinteisto_id: string
          kohde: string | null
          kohde_avain: string | null
          kulu_id: string | null
          kustannus: number | null
          kuvaus: string | null
          pts_siirto: number | null
          pvm: string
          takuu_vuotta: number | null
          tekija: string | null
          tekija_nimi: string | null
          tyyppi: string
        }
        Insert: {
          created_at?: string
          id?: string
          kategoria?: string | null
          kiinteisto_id: string
          kohde?: string | null
          kohde_avain?: string | null
          kulu_id?: string | null
          kustannus?: number | null
          kuvaus?: string | null
          pts_siirto?: number | null
          pvm: string
          takuu_vuotta?: number | null
          tekija?: string | null
          tekija_nimi?: string | null
          tyyppi: string
        }
        Update: {
          created_at?: string
          id?: string
          kategoria?: string | null
          kiinteisto_id?: string
          kohde?: string | null
          kohde_avain?: string | null
          kulu_id?: string | null
          kustannus?: number | null
          kuvaus?: string | null
          pts_siirto?: number | null
          pvm?: string
          takuu_vuotta?: number | null
          tekija?: string | null
          tekija_nimi?: string | null
          tyyppi?: string
        }
        Relationships: [
          {
            foreignKeyName: "huolto_historia_kiinteisto_id_fkey"
            columns: ["kiinteisto_id"]
            isOneToOne: false
            referencedRelation: "kiinteistot"
            referencedColumns: ["id"]
          },
        ]
      }
      kayttaja_metriikat: {
        Row: {
          huoltoja_kirjattu: number
          id: string
          kausikirje_suostumus: boolean
          kirjautumisia: number
          liideja_lahetetty: number
          nps_annettu_at: string | null
          nps_pisteet: number | null
          paivitetty_at: string
          pts_avattu: boolean
          rekisteroity_at: string
          talon_tiedot_taytetty: boolean
          user_id: string
          viimeisin_kirjautuminen: string | null
          vuosikelloa_kuitattu: number
        }
        Insert: {
          huoltoja_kirjattu?: number
          id?: string
          kausikirje_suostumus?: boolean
          kirjautumisia?: number
          liideja_lahetetty?: number
          nps_annettu_at?: string | null
          nps_pisteet?: number | null
          paivitetty_at?: string
          pts_avattu?: boolean
          rekisteroity_at?: string
          talon_tiedot_taytetty?: boolean
          user_id: string
          viimeisin_kirjautuminen?: string | null
          vuosikelloa_kuitattu?: number
        }
        Update: {
          huoltoja_kirjattu?: number
          id?: string
          kausikirje_suostumus?: boolean
          kirjautumisia?: number
          liideja_lahetetty?: number
          nps_annettu_at?: string | null
          nps_pisteet?: number | null
          paivitetty_at?: string
          pts_avattu?: boolean
          rekisteroity_at?: string
          talon_tiedot_taytetty?: boolean
          user_id?: string
          viimeisin_kirjautuminen?: string | null
          vuosikelloa_kuitattu?: number
        }
        Relationships: []
      }
      kiinteistot: {
        Row: {
          aktiivinen: boolean
          created_at: string
          hankinta_vuosi: number | null
          hankintatapa: string | null
          id: string
          kaupunki: string | null
          nimi: string | null
          osoite: string | null
          postinumero: string | null
          rakennusvuosi: number | null
          tyyppi: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          aktiivinen?: boolean
          created_at?: string
          hankinta_vuosi?: number | null
          hankintatapa?: string | null
          id?: string
          kaupunki?: string | null
          nimi?: string | null
          osoite?: string | null
          postinumero?: string | null
          rakennusvuosi?: number | null
          tyyppi?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          aktiivinen?: boolean
          created_at?: string
          hankinta_vuosi?: number | null
          hankintatapa?: string | null
          id?: string
          kaupunki?: string | null
          nimi?: string | null
          osoite?: string | null
          postinumero?: string | null
          rakennusvuosi?: number | null
          tyyppi?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      kulu_asetukset: {
        Row: {
          edellinen_mittarilukema: number | null
          edellinen_sahkomittari: number | null
          edellinen_sahkomittari_pvm: string | null
          edellinen_vesimittari_pvm: string | null
          id: string
          kiinteisto_id: string
          sahko_energia_snt: number | null
          sahko_perusmaksu_eur_kk: number | null
          sahko_siirto_snt: number | null
          updated_at: string
          vesi_jatevesi_eur_m3: number | null
          vesi_perusmaksu_eur_kk: number | null
          vesi_puhdas_eur_m3: number | null
        }
        Insert: {
          edellinen_mittarilukema?: number | null
          edellinen_sahkomittari?: number | null
          edellinen_sahkomittari_pvm?: string | null
          edellinen_vesimittari_pvm?: string | null
          id?: string
          kiinteisto_id: string
          sahko_energia_snt?: number | null
          sahko_perusmaksu_eur_kk?: number | null
          sahko_siirto_snt?: number | null
          updated_at?: string
          vesi_jatevesi_eur_m3?: number | null
          vesi_perusmaksu_eur_kk?: number | null
          vesi_puhdas_eur_m3?: number | null
        }
        Update: {
          edellinen_mittarilukema?: number | null
          edellinen_sahkomittari?: number | null
          edellinen_sahkomittari_pvm?: string | null
          edellinen_vesimittari_pvm?: string | null
          id?: string
          kiinteisto_id?: string
          sahko_energia_snt?: number | null
          sahko_perusmaksu_eur_kk?: number | null
          sahko_siirto_snt?: number | null
          updated_at?: string
          vesi_jatevesi_eur_m3?: number | null
          vesi_perusmaksu_eur_kk?: number | null
          vesi_puhdas_eur_m3?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kulu_asetukset_kiinteisto_id_fkey"
            columns: ["kiinteisto_id"]
            isOneToOne: true
            referencedRelation: "kiinteistot"
            referencedColumns: ["id"]
          },
        ]
      }
      kulut: {
        Row: {
          created_at: string
          huolto_id: string | null
          id: string
          kategoria: string
          kiinteisto_id: string
          kohde_avain: string | null
          kulutus_m3: number | null
          kuvaus: string | null
          kwh: number | null
          mittarilukema: number | null
          nimi: string | null
          pvm: string
          summa: number
        }
        Insert: {
          created_at?: string
          huolto_id?: string | null
          id?: string
          kategoria?: string
          kiinteisto_id: string
          kohde_avain?: string | null
          kulutus_m3?: number | null
          kuvaus?: string | null
          kwh?: number | null
          mittarilukema?: number | null
          nimi?: string | null
          pvm: string
          summa?: number
        }
        Update: {
          created_at?: string
          huolto_id?: string | null
          id?: string
          kategoria?: string
          kiinteisto_id?: string
          kohde_avain?: string | null
          kulutus_m3?: number | null
          kuvaus?: string | null
          kwh?: number | null
          mittarilukema?: number | null
          nimi?: string | null
          pvm?: string
          summa?: number
        }
        Relationships: [
          {
            foreignKeyName: "kulut_kiinteisto_id_fkey"
            columns: ["kiinteisto_id"]
            isOneToOne: false
            referencedRelation: "kiinteistot"
            referencedColumns: ["id"]
          },
        ]
      }
      liidi_asetukset: {
        Row: {
          automaatio_paalla: boolean
          id: string
          updated_at: string
        }
        Insert: {
          automaatio_paalla?: boolean
          id?: string
          updated_at?: string
        }
        Update: {
          automaatio_paalla?: boolean
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      liidit: {
        Row: {
          ammattilainen_id: string | null
          created_at: string
          id: string
          kategoria: string
          kaupunki: string | null
          kiinteisto_id: string
          kuvaus: string | null
          lahetetty_at: string | null
          lammitys: string | null
          lisatieto: string | null
          maakunta: string | null
          nimi: string
          osoite: string | null
          palvelu: string
          pts_kohde: string | null
          puhelin: string
          rakennus_vuosi: number | null
          sahkoposti: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ammattilainen_id?: string | null
          created_at?: string
          id?: string
          kategoria: string
          kaupunki?: string | null
          kiinteisto_id: string
          kuvaus?: string | null
          lahetetty_at?: string | null
          lammitys?: string | null
          lisatieto?: string | null
          maakunta?: string | null
          nimi: string
          osoite?: string | null
          palvelu: string
          pts_kohde?: string | null
          puhelin: string
          rakennus_vuosi?: number | null
          sahkoposti: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ammattilainen_id?: string | null
          created_at?: string
          id?: string
          kategoria?: string
          kaupunki?: string | null
          kiinteisto_id?: string
          kuvaus?: string | null
          lahetetty_at?: string | null
          lammitys?: string | null
          lisatieto?: string | null
          maakunta?: string | null
          nimi?: string
          osoite?: string | null
          palvelu?: string
          pts_kohde?: string | null
          puhelin?: string
          rakennus_vuosi?: number | null
          sahkoposti?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "liidit_ammattilainen_id_fkey"
            columns: ["ammattilainen_id"]
            isOneToOne: false
            referencedRelation: "ammattilaiset"
            referencedColumns: ["id"]
          },
        ]
      }
      palaute_kyselyt: {
        Row: {
          created_at: string
          id: string
          lahetetty_at: string
          token: string
          token_voimassa: string
          trigger_id: string | null
          tyyppi: string
          updated_at: string
          user_id: string | null
          vastattu_at: string | null
          vastaukset: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          lahetetty_at?: string
          token?: string
          token_voimassa?: string
          trigger_id?: string | null
          tyyppi: string
          updated_at?: string
          user_id?: string | null
          vastattu_at?: string | null
          vastaukset?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          lahetetty_at?: string
          token?: string
          token_voimassa?: string
          trigger_id?: string | null
          tyyppi?: string
          updated_at?: string
          user_id?: string | null
          vastattu_at?: string | null
          vastaukset?: Json | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nimi: string | null
          puhelin: string | null
          updated_at: string
          valittu_kiinteisto_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          nimi?: string | null
          puhelin?: string | null
          updated_at?: string
          valittu_kiinteisto_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nimi?: string | null
          puhelin?: string | null
          updated_at?: string
          valittu_kiinteisto_id?: string | null
        }
        Relationships: []
      }
      pts_suunnitelma: {
        Row: {
          created_at: string
          huoltovali: number
          id: string
          kategoria: string
          kayttoika: number
          kiinteisto_id: string
          kiireellisyys: string
          kohde_avain: string
          kohde_nimi: string
          kuvaus: string | null
          lahde_vuosi: number | null
          oma_rivi: boolean
          paivitetty_at: string
          toimenpide_vuosi: number
          viimeisin_huolto_vuosi: number | null
          viimeisin_uusiminen_vuosi: number | null
        }
        Insert: {
          created_at?: string
          huoltovali?: number
          id?: string
          kategoria: string
          kayttoika?: number
          kiinteisto_id: string
          kiireellisyys?: string
          kohde_avain: string
          kohde_nimi: string
          kuvaus?: string | null
          lahde_vuosi?: number | null
          oma_rivi?: boolean
          paivitetty_at?: string
          toimenpide_vuosi: number
          viimeisin_huolto_vuosi?: number | null
          viimeisin_uusiminen_vuosi?: number | null
        }
        Update: {
          created_at?: string
          huoltovali?: number
          id?: string
          kategoria?: string
          kayttoika?: number
          kiinteisto_id?: string
          kiireellisyys?: string
          kohde_avain?: string
          kohde_nimi?: string
          kuvaus?: string | null
          lahde_vuosi?: number | null
          oma_rivi?: boolean
          paivitetty_at?: string
          toimenpide_vuosi?: number
          viimeisin_huolto_vuosi?: number | null
          viimeisin_uusiminen_vuosi?: number | null
        }
        Relationships: []
      }
      talo_dokumentit: {
        Row: {
          created_at: string
          huolto_id: string | null
          id: string
          kiinteisto_id: string
          koko_bytes: number | null
          kuvaus: string | null
          lisatty_pvm: string
          mime: string | null
          nimi: string
          tiedosto_polku: string
          tyyppi: string
        }
        Insert: {
          created_at?: string
          huolto_id?: string | null
          id?: string
          kiinteisto_id: string
          koko_bytes?: number | null
          kuvaus?: string | null
          lisatty_pvm?: string
          mime?: string | null
          nimi: string
          tiedosto_polku: string
          tyyppi?: string
        }
        Update: {
          created_at?: string
          huolto_id?: string | null
          id?: string
          kiinteisto_id?: string
          koko_bytes?: number | null
          kuvaus?: string | null
          lisatty_pvm?: string
          mime?: string | null
          nimi?: string
          tiedosto_polku?: string
          tyyppi?: string
        }
        Relationships: []
      }
      talon_tiedot: {
        Row: {
          asukkaita: number | null
          aurinkopaneelit: boolean
          created_at: string
          data: Json | null
          eriste: string | null
          hormien_maara: number | null
          hormit: string | null
          hormityyppi: string | null
          id: string
          ikkunat_tyyppi: string | null
          ikkunat_uusittu_vuosi: number | null
          ilmanvaihto: string | null
          ilmanvaihto_vuosi: number | null
          ilp_asennettu_vuosi: number | null
          ilp_malli: string | null
          ilp_merkki: string | null
          iv_suodatin_vaihdettu: string | null
          iv_suodatintyyppi: string | null
          julkisivu_asennettu_vuosi: number | null
          julkisivu_maalattu_vuosi: number | null
          julkisivumateriaali: string | null
          katto_pinta_ala: number | null
          katto_uusittu_vuosi: number | null
          kattomateriaali: string | null
          kattoturvatuotteet: string | null
          kattotyyppi: string | null
          kerroksia: number | null
          kiinteisto_id: string
          kiuas_tyyppi: string | null
          kiukaan_vuosi: number | null
          kokonaispinta_ala: number | null
          kourun_materiaali: string | null
          kourun_pituus: number | null
          lammitys_asennettu_vuosi: number | null
          lammitys_lisatieto: Json | null
          lammitysmuoto: string | null
          nuohous_pvm: string | null
          nurmikon_pinta_ala: number | null
          paasulun_sijainti: string | null
          palovaroitin_paristot: string | null
          palovaroittimia: number | null
          perustus: string | null
          piha_lisatieto: string | null
          pihan_tyyppi: string | null
          pinta_ala: number | null
          putket_uusittu_vuosi: number | null
          putkimateriaali: string | null
          rakennus_lisatieto: string | null
          rakennustapa: string | null
          raystaat_kunnostettu_vuosi: number | null
          sadevesikaivot: number | null
          sahkot_asennettu_vuosi: number | null
          salaojat: boolean | null
          salaojat_tarkastettu: string | null
          syoksytorvet: number | null
          terassi_kunnostettu_vuosi: number | null
          terassi_lasitettu: boolean | null
          terassi_lasitus_vuosi: number | null
          terassi_materiaali: string | null
          terassi_pinta_ala: number | null
          terassi_rakennettu_vuosi: number | null
          tilavuus: number | null
          tontin_pinta_ala: number | null
          updated_at: string
          valmiit_osiot: Json | null
          viemari_asennettu_vuosi: number | null
          viemarimateriaali: string | null
        }
        Insert: {
          asukkaita?: number | null
          aurinkopaneelit?: boolean
          created_at?: string
          data?: Json | null
          eriste?: string | null
          hormien_maara?: number | null
          hormit?: string | null
          hormityyppi?: string | null
          id?: string
          ikkunat_tyyppi?: string | null
          ikkunat_uusittu_vuosi?: number | null
          ilmanvaihto?: string | null
          ilmanvaihto_vuosi?: number | null
          ilp_asennettu_vuosi?: number | null
          ilp_malli?: string | null
          ilp_merkki?: string | null
          iv_suodatin_vaihdettu?: string | null
          iv_suodatintyyppi?: string | null
          julkisivu_asennettu_vuosi?: number | null
          julkisivu_maalattu_vuosi?: number | null
          julkisivumateriaali?: string | null
          katto_pinta_ala?: number | null
          katto_uusittu_vuosi?: number | null
          kattomateriaali?: string | null
          kattoturvatuotteet?: string | null
          kattotyyppi?: string | null
          kerroksia?: number | null
          kiinteisto_id: string
          kiuas_tyyppi?: string | null
          kiukaan_vuosi?: number | null
          kokonaispinta_ala?: number | null
          kourun_materiaali?: string | null
          kourun_pituus?: number | null
          lammitys_asennettu_vuosi?: number | null
          lammitys_lisatieto?: Json | null
          lammitysmuoto?: string | null
          nuohous_pvm?: string | null
          nurmikon_pinta_ala?: number | null
          paasulun_sijainti?: string | null
          palovaroitin_paristot?: string | null
          palovaroittimia?: number | null
          perustus?: string | null
          piha_lisatieto?: string | null
          pihan_tyyppi?: string | null
          pinta_ala?: number | null
          putket_uusittu_vuosi?: number | null
          putkimateriaali?: string | null
          rakennus_lisatieto?: string | null
          rakennustapa?: string | null
          raystaat_kunnostettu_vuosi?: number | null
          sadevesikaivot?: number | null
          sahkot_asennettu_vuosi?: number | null
          salaojat?: boolean | null
          salaojat_tarkastettu?: string | null
          syoksytorvet?: number | null
          terassi_kunnostettu_vuosi?: number | null
          terassi_lasitettu?: boolean | null
          terassi_lasitus_vuosi?: number | null
          terassi_materiaali?: string | null
          terassi_pinta_ala?: number | null
          terassi_rakennettu_vuosi?: number | null
          tilavuus?: number | null
          tontin_pinta_ala?: number | null
          updated_at?: string
          valmiit_osiot?: Json | null
          viemari_asennettu_vuosi?: number | null
          viemarimateriaali?: string | null
        }
        Update: {
          asukkaita?: number | null
          aurinkopaneelit?: boolean
          created_at?: string
          data?: Json | null
          eriste?: string | null
          hormien_maara?: number | null
          hormit?: string | null
          hormityyppi?: string | null
          id?: string
          ikkunat_tyyppi?: string | null
          ikkunat_uusittu_vuosi?: number | null
          ilmanvaihto?: string | null
          ilmanvaihto_vuosi?: number | null
          ilp_asennettu_vuosi?: number | null
          ilp_malli?: string | null
          ilp_merkki?: string | null
          iv_suodatin_vaihdettu?: string | null
          iv_suodatintyyppi?: string | null
          julkisivu_asennettu_vuosi?: number | null
          julkisivu_maalattu_vuosi?: number | null
          julkisivumateriaali?: string | null
          katto_pinta_ala?: number | null
          katto_uusittu_vuosi?: number | null
          kattomateriaali?: string | null
          kattoturvatuotteet?: string | null
          kattotyyppi?: string | null
          kerroksia?: number | null
          kiinteisto_id?: string
          kiuas_tyyppi?: string | null
          kiukaan_vuosi?: number | null
          kokonaispinta_ala?: number | null
          kourun_materiaali?: string | null
          kourun_pituus?: number | null
          lammitys_asennettu_vuosi?: number | null
          lammitys_lisatieto?: Json | null
          lammitysmuoto?: string | null
          nuohous_pvm?: string | null
          nurmikon_pinta_ala?: number | null
          paasulun_sijainti?: string | null
          palovaroitin_paristot?: string | null
          palovaroittimia?: number | null
          perustus?: string | null
          piha_lisatieto?: string | null
          pihan_tyyppi?: string | null
          pinta_ala?: number | null
          putket_uusittu_vuosi?: number | null
          putkimateriaali?: string | null
          rakennus_lisatieto?: string | null
          rakennustapa?: string | null
          raystaat_kunnostettu_vuosi?: number | null
          sadevesikaivot?: number | null
          sahkot_asennettu_vuosi?: number | null
          salaojat?: boolean | null
          salaojat_tarkastettu?: string | null
          syoksytorvet?: number | null
          terassi_kunnostettu_vuosi?: number | null
          terassi_lasitettu?: boolean | null
          terassi_lasitus_vuosi?: number | null
          terassi_materiaali?: string | null
          terassi_pinta_ala?: number | null
          terassi_rakennettu_vuosi?: number | null
          tilavuus?: number | null
          tontin_pinta_ala?: number | null
          updated_at?: string
          valmiit_osiot?: Json | null
          viemari_asennettu_vuosi?: number | null
          viemarimateriaali?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "talon_tiedot_kiinteisto_id_fkey"
            columns: ["kiinteisto_id"]
            isOneToOne: true
            referencedRelation: "kiinteistot"
            referencedColumns: ["id"]
          },
        ]
      }
      toistuvat_kulut: {
        Row: {
          aktiivinen: boolean
          alkuvuosi: number
          created_at: string
          eraantymiskuukausi: number
          id: string
          kategoria: string
          kiinteisto_id: string
          nimi: string
          summa: number
          updated_at: string
        }
        Insert: {
          aktiivinen?: boolean
          alkuvuosi?: number
          created_at?: string
          eraantymiskuukausi?: number
          id?: string
          kategoria?: string
          kiinteisto_id: string
          nimi: string
          summa?: number
          updated_at?: string
        }
        Update: {
          aktiivinen?: boolean
          alkuvuosi?: number
          created_at?: string
          eraantymiskuukausi?: number
          id?: string
          kategoria?: string
          kiinteisto_id?: string
          nimi?: string
          summa?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "toistuvat_kulut_kiinteisto_id_fkey"
            columns: ["kiinteisto_id"]
            isOneToOne: false
            referencedRelation: "kiinteistot"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vk_kuitatut: {
        Row: {
          created_at: string
          hinta: number | null
          historia_id: string | null
          huolto_nimi: string
          id: string
          kausi_key: string
          kiinteisto_id: string
          kuitattu_pvm: string
          tekija: string | null
          vuosi: number
        }
        Insert: {
          created_at?: string
          hinta?: number | null
          historia_id?: string | null
          huolto_nimi: string
          id?: string
          kausi_key: string
          kiinteisto_id: string
          kuitattu_pvm?: string
          tekija?: string | null
          vuosi: number
        }
        Update: {
          created_at?: string
          hinta?: number | null
          historia_id?: string | null
          huolto_nimi?: string
          id?: string
          kausi_key?: string
          kiinteisto_id?: string
          kuitattu_pvm?: string
          tekija?: string | null
          vuosi?: number
        }
        Relationships: [
          {
            foreignKeyName: "vk_kuitatut_historia_id_fkey"
            columns: ["historia_id"]
            isOneToOne: false
            referencedRelation: "huolto_historia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vk_kuitatut_kiinteisto_id_fkey"
            columns: ["kiinteisto_id"]
            isOneToOne: false
            referencedRelation: "kiinteistot"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      inkrementoi_metriikka: {
        Args: { _kentta: string; _maara?: number; _user_id: string }
        Returns: undefined
      }
      omistaa_kiinteiston: {
        Args: { _kiinteisto_id: string }
        Returns: boolean
      }
      paivita_ammattilainen_pisteet: {
        Args: { _amm_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
