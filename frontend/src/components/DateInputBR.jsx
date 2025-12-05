import { Calendar } from 'lucide-react';
import { formatDateBR } from '../utils/dateFormat';

const DateInputBR = ({ value, onChange, className = '' }) => {
  const handleInputChange = (e) => {
    const inputValue = e.target.value;

    // Remove tudo que não é número
    const numbers = inputValue.replace(/\D/g, '');

    // Formata conforme o usuário digita
    let formatted = '';
    if (numbers.length > 0) {
      formatted = numbers.substring(0, 2); // DD
      if (numbers.length >= 3) {
        formatted += '/' + numbers.substring(2, 4); // MM
      }
      if (numbers.length >= 5) {
        formatted += '/' + numbers.substring(4, 8); // YYYY
      }
    }

    // Se completou dd/mm/yyyy, converte para yyyy-mm-dd
    if (numbers.length === 8) {
      const day = numbers.substring(0, 2);
      const month = numbers.substring(2, 4);
      const year = numbers.substring(4, 8);

      // Validação básica
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);

      if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum >= 1900 && yearNum <= 2100) {
        const isoDate = `${year}-${month}-${day}`;
        onChange({ target: { value: isoDate } });
      }
    }
  };

  // Converte yyyy-mm-dd para dd/mm/yyyy para exibição
  const displayValue = value ? formatDateBR(value) : '';

  const handleNativeChange = (e) => {
    onChange(e);
  };

  return (
    <div className="relative">
      {/* Input customizado para desktop */}
      <div className="hidden md:flex items-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl focus-within:border-blue-500 bg-white">
        <Calendar className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="dd/mm/aaaa"
          value={displayValue}
          onChange={handleInputChange}
          maxLength={10}
          className="flex-1 outline-none font-semibold"
        />
      </div>

      {/* Input nativo para mobile (melhor UX em dispositivos móveis) */}
      <div className="md:hidden">
        <input
          type="date"
          value={value}
          onChange={handleNativeChange}
          className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none font-semibold ${className}`}
        />
      </div>
    </div>
  );
};

export default DateInputBR;
