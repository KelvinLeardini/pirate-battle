// Gerenciador de Efeitos Sonoros para a UI Náutica
export const playSound = (soundName: string, volume: number = 0.4) => {
  try {
    const audio = new Audio(`/assets/sounds/${soundName}.wav`);
    audio.volume = volume;
    audio.play().catch(() => {
      // Ignora erro se o navegador bloquear autoplay sem interação prévia
    });
  } catch (err) {
    console.debug('Erro ao reproduzir som:', err);
  }
};

