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
      huolto_historia: {
        Row: {
          created_at: string
          id: string
          kategoria: string | null
          kiinteisto_id: string
          kohde: string | null
          kustannus: number | null
          kuvaus: string | null
          pts_siirto: boolean | null
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
          kustannus?: number | null
          kuvaus?: string | null
          pts_siirto?: boolean | null
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
          kustannus?: number | null
          kuvaus?: string | null
          pts_siirto?: boolean | null
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
      kiinteistot: {
        Row: {
          aktiivinen: boolean
          created_at: string
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
          id: string
          kiinteisto_id: string
          sahko_energia_snt: number | null
          sahko_siirto_snt: number | null
          updated_at: string
          vesi_jatevesi_eur_m3: number | null
          vesi_puhdas_eur_m3: number | null
        }
        Insert: {
          edellinen_mittarilukema?: number | null
          id?: string
          kiinteisto_id: string
          sahko_energia_snt?: number | null
          sahko_siirto_snt?: number | null
          updated_at?: string
          vesi_jatevesi_eur_m3?: number | null
          vesi_puhdas_eur_m3?: number | null
        }
        Update: {
          edellinen_mittarilukema?: number | null
          id?: string
          kiinteisto_id?: string
          sahko_energia_snt?: number | null
          sahko_siirto_snt?: number | null
          updated_at?: string
          vesi_jatevesi_eur_m3?: number | null
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
          id: string
          kategoria: string
          kiinteisto_id: string
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
          id?: string
          kategoria?: string
          kiinteisto_id: string
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
          id?: string
          kategoria?: string
          kiinteisto_id?: string
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
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nimi: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          nimi?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nimi?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      talon_tiedot: {
        Row: {
          asukkaita: number | null
          created_at: string
          data: Json | null
          id: string
          ilmanvaihto: string | null
          ilmanvaihto_vuosi: number | null
          julkisivu_maalattu_vuosi: number | null
          julkisivumateriaali: string | null
          katto_uusittu_vuosi: number | null
          kattomateriaali: string | null
          kattotyyppi: string | null
          kerroksia: number | null
          kiinteisto_id: string
          lammitys_asennettu_vuosi: number | null
          lammitys_lisatieto: Json | null
          lammitysmuoto: string | null
          piha_lisatieto: string | null
          pihan_tyyppi: string | null
          pinta_ala: number | null
          putket_uusittu_vuosi: number | null
          putkimateriaali: string | null
          rakennustapa: string | null
          raystaat_kunnostettu_vuosi: number | null
          sahkot_asennettu_vuosi: number | null
          terassi_kunnostettu_vuosi: number | null
          terassi_materiaali: string | null
          tilavuus: number | null
          tontin_pinta_ala: number | null
          updated_at: string
          valmiit_osiot: Json | null
          viemari_asennettu_vuosi: number | null
          viemarimateriaali: string | null
        }
        Insert: {
          asukkaita?: number | null
          created_at?: string
          data?: Json | null
          id?: string
          ilmanvaihto?: string | null
          ilmanvaihto_vuosi?: number | null
          julkisivu_maalattu_vuosi?: number | null
          julkisivumateriaali?: string | null
          katto_uusittu_vuosi?: number | null
          kattomateriaali?: string | null
          kattotyyppi?: string | null
          kerroksia?: number | null
          kiinteisto_id: string
          lammitys_asennettu_vuosi?: number | null
          lammitys_lisatieto?: Json | null
          lammitysmuoto?: string | null
          piha_lisatieto?: string | null
          pihan_tyyppi?: string | null
          pinta_ala?: number | null
          putket_uusittu_vuosi?: number | null
          putkimateriaali?: string | null
          rakennustapa?: string | null
          raystaat_kunnostettu_vuosi?: number | null
          sahkot_asennettu_vuosi?: number | null
          terassi_kunnostettu_vuosi?: number | null
          terassi_materiaali?: string | null
          tilavuus?: number | null
          tontin_pinta_ala?: number | null
          updated_at?: string
          valmiit_osiot?: Json | null
          viemari_asennettu_vuosi?: number | null
          viemarimateriaali?: string | null
        }
        Update: {
          asukkaita?: number | null
          created_at?: string
          data?: Json | null
          id?: string
          ilmanvaihto?: string | null
          ilmanvaihto_vuosi?: number | null
          julkisivu_maalattu_vuosi?: number | null
          julkisivumateriaali?: string | null
          katto_uusittu_vuosi?: number | null
          kattomateriaali?: string | null
          kattotyyppi?: string | null
          kerroksia?: number | null
          kiinteisto_id?: string
          lammitys_asennettu_vuosi?: number | null
          lammitys_lisatieto?: Json | null
          lammitysmuoto?: string | null
          piha_lisatieto?: string | null
          pihan_tyyppi?: string | null
          pinta_ala?: number | null
          putket_uusittu_vuosi?: number | null
          putkimateriaali?: string | null
          rakennustapa?: string | null
          raystaat_kunnostettu_vuosi?: number | null
          sahkot_asennettu_vuosi?: number | null
          terassi_kunnostettu_vuosi?: number | null
          terassi_materiaali?: string | null
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
      vk_kuitatut: {
        Row: {
          created_at: string
          hinta: number | null
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
      omistaa_kiinteiston: {
        Args: { _kiinteisto_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
