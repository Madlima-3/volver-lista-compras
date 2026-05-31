const BASE_URL = 'https://api.mymemory.translated.net/get';

export async function traduzir(texto, de = 'pt', para = 'en') {
  const url = `${BASE_URL}?q=${encodeURIComponent(texto)}&langpair=${de}|${para}`;
  const res = await fetch(url);
  if (!res.ok) return texto;
  const data = await res.json();
  return data.responseData?.translatedText || texto;
}
