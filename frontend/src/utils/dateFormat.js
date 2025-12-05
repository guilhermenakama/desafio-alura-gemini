/**
 * Formata uma data no padrão brasileiro (dd/mm/yyyy)
 * @param {string|Date} date - Data no formato ISO ou objeto Date
 * @returns {string} Data formatada como dd/mm/yyyy
 */
export const formatDateBR = (date) => {
  if (!date) return '';

  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Formata uma data/hora no padrão brasileiro (dd/mm/yyyy HH:mm)
 * @param {string|Date} datetime - Data/hora no formato ISO ou objeto Date
 * @returns {string} Data/hora formatada
 */
export const formatDateTimeBR = (datetime) => {
  if (!datetime) return '';

  const d = typeof datetime === 'string' ? new Date(datetime) : datetime;
  const date = formatDateBR(d);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${date} ${hours}:${minutes}`;
};

/**
 * Formata data relativa (hoje, ontem, etc)
 * @param {string|Date} date - Data para formatar
 * @returns {string} Descrição relativa da data
 */
export const formatRelativeDate = (date) => {
  if (!date) return '';

  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dDay = d.getDate();
  const dMonth = d.getMonth();
  const dYear = d.getFullYear();

  const todayDay = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const yesterdayDay = yesterday.getDate();
  const yesterdayMonth = yesterday.getMonth();
  const yesterdayYear = yesterday.getFullYear();

  if (dDay === todayDay && dMonth === todayMonth && dYear === todayYear) {
    return 'Hoje';
  } else if (dDay === yesterdayDay && dMonth === yesterdayMonth && dYear === yesterdayYear) {
    return 'Ontem';
  } else {
    return formatDateBR(d);
  }
};
