// Cuotas reales de Betano vía OddsPapi (oddspapi.io).
//
// DESACTIVADO POR AHORA: la respuesta real de /odds-by-tournaments no usa nombres de equipos ni
// nombres de mercado legibles — usa solo IDs numéricos (participant1Id/participant2Id, mercados
// "101","102","103"...). Para traducir esos IDs a "Gana/Empata/Gana" o "Más/Menos de 2.5 goles"
// se necesita el diccionario de equipos y de mercados de OddsPapi (probablemente otro endpoint,
// no explorado todavía). Mientras no se resuelva eso, esta función no hace ninguna llamada real
// y devuelve siempre vacío — no rompe el cron, simplemente Betano no se autocompleta.
import { FetchedOdds } from '@/lib/oddsApi';

export async function fetchBetanoOdds(): Promise<FetchedOdds[]> {
  return [];
}
