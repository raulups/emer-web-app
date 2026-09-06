/**
 * Tipos de la base de datos, con la forma que genera
 * `supabase gen types typescript` para el esquema `public`.
 *
 * Se mantienen a mano para reflejar exactamente el esquema descrito
 * en el catálogo (profiles, brands, categories, products,
 * product_price_history, store_locations). Si el esquema cambia, regenerar
 * con la Supabase CLI:
 *
 *   supabase gen types typescript --project-id <project-id> > lib/types/database.ts
 *
 * `Relationships: []` en cada tabla no es adorno: supabase-js exige esa clave
 * para que el esquema encaje en su `GenericTable`. Sin ella, todo el esquema
 * degrada a `any` en silencio —los `select()` siguen compilando, pero
 * `insert()` resuelve a `never` y no se puede usar—. Va vacío porque los
 * `select()` con recursos embebidos (`brand:brands(...)`) ya se castean a
 * mano a los tipos de `lib/types/index.ts`, así que no dependemos del
 * inferidor de relaciones.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: "user" | "admin";
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      brands: {
        Row: {
          id: string;
          name: string;
          url: string | null;
          img: string | null;
          logo: string | null;
          color: string | null;
          /** @deprecated Sustituido por `tags`; se elimina en la limpieza de brand_priority.sql. */
          is_emergent: boolean | null;
          tags: Database["public"]["Enums"]["brand_tag"][] | null;
          /**
           * Columna GENERADA por supabase/sql/brand_priority.sql a partir de
           * `tags` (popular 1, emergente 2, novedad 3, resto 4). Es de solo
           * lectura: Postgres la rechaza en INSERT/UPDATE, por eso se excluye
           * de Insert/Update más abajo.
           */
          tag_priority: number;
          created_at: string;
        };
        Insert: Partial<
          Omit<Database["public"]["Tables"]["brands"]["Row"], "tag_priority">
        >;
        Update: Partial<
          Omit<Database["public"]["Tables"]["brands"]["Row"], "tag_priority">
        >;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          parent_id: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["categories"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["categories"]["Row"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          brand_id: string;
          category_id: string | null;
          external_id: string | null;
          name: string;
          description: string | null;
          product_url: string | null;
          currency: string | null;
          current_price: number | null;
          original_price: number | null;
          is_on_sale: boolean | null;
          available: boolean | null;
          main_image_url: string | null;
          thumbnail_image_url: string | null;
          image_urls: Json | null;
          color_name: string | null;
          attributes: Json | null;
          sizes: Json | null;
          handle: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["products"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["products"]["Row"]>;
        Relationships: [];
      };
      product_price_history: {
        Row: {
          id: string;
          product_id: string;
          price: number;
          currency: string | null;
          scraped_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["product_price_history"]["Row"]
        >;
        Update: Partial<
          Database["public"]["Tables"]["product_price_history"]["Row"]
        >;
        Relationships: [];
      };
      store_locations: {
        Row: {
          id: string;
          brand_id: string;
          address: string | null;
          city: string | null;
          latitude: number | null;
          longitude: number | null;
          place_id: string | null;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["store_locations"]["Row"]
        >;
        Update: Partial<
          Database["public"]["Tables"]["store_locations"]["Row"]
        >;
        Relationships: [];
      };
    };
    Views: {
      /**
       * `products` + la prioridad de tag de su marca, creada en
       * supabase/sql/brand_priority.sql. Existe para poder ordenar el
       * catálogo por esa prioridad sin añadir una columna redundante a
       * `products` que habría que mantener sincronizada.
       */
      products_with_brand_priority: {
        Row: Database["public"]["Tables"]["products"]["Row"] & {
          brand_tag_priority: number;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      brand_tag: "popular" | "emergente" | "novedad";
    };
  };
}
