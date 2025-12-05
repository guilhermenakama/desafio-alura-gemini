import { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronUp, Dumbbell, BookOpen, Target, Activity, TrendingUp, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDateBR, formatRelativeDate } from '../utils/dateFormat';

const API_URL = window.location.hostname === 'localhost'
  ? 'http://127.0.0.1:8000'
  : `${window.location.protocol}//${window.location.host}`;

const History = ({ token }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState(new Set());
  const [days, setDays] = useState(7); // Número de dias para carregar
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, [token, days]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // Buscar dados dos últimos N dias
      const today = new Date();
      const historyData = [];

      for (let i = 0; i < days; i++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() - i);
        const dateStr = currentDate.toISOString().split('T')[0];

        // Buscar dados do dia
        const [habitLogs, workouts, journals] = await Promise.all([
          fetch(`${API_URL}/api/tracker/habit-logs/?date=${dateStr}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).then(res => res.ok ? res.json() : []),

          fetch(`${API_URL}/api/tracker/workouts/?date=${dateStr}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).then(res => res.ok ? res.json() : []),

          fetch(`${API_URL}/api/tracker/journal/?date=${dateStr}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).then(res => res.ok ? res.json() : [])
        ]);

        const completedHabits = habitLogs.filter(log => log.completed);
        const workout = workouts.length > 0 ? workouts[0] : null;
        const journal = journals.length > 0 ? journals[0] : null;

        // Só adicionar se tiver algum dado
        if (completedHabits.length > 0 || workout || journal) {
          historyData.push({
            date: dateStr,
            completedHabits,
            workout,
            journal
          });
        }
      }

      setHistory(historyData);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (date) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDays(newExpanded);
  };

  const handleEditDay = (date) => {
    // Navegar para o DailyLog com a data selecionada
    navigate(`/?date=${date}`);
  };

  const getMoodEmoji = (moodRating) => {
    const emojis = ['😭', '😕', '😐', '🙂', '🤩'];
    return emojis[moodRating - 1] || '😐';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-lg">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Histórico de Jornadas</h1>
                <p className="text-gray-600 text-sm">Veja seu progresso ao longo do tempo</p>
              </div>
            </div>

            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none font-semibold"
            >
              <option value={7}>Últimos 7 dias</option>
              <option value={14}>Últimos 14 dias</option>
              <option value={30}>Últimos 30 dias</option>
              <option value={60}>Últimos 60 dias</option>
              <option value={90}>Últimos 90 dias</option>
            </select>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-100">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs font-semibold text-green-600">TOTAL</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{history.length}</p>
            <p className="text-sm text-gray-600">Dias registrados</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Dumbbell className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs font-semibold text-blue-600">TREINOS</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {history.filter(d => d.workout).length}
            </p>
            <p className="text-sm text-gray-600">Treinos realizados</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-xs font-semibold text-purple-600">REFLEXÕES</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {history.filter(d => d.journal).length}
            </p>
            <p className="text-sm text-gray-600">Diários escritos</p>
          </div>
        </div>

        {/* Timeline de Histórico */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Activity className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Carregando histórico...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-semibold">Nenhum registro encontrado</p>
              <p className="text-gray-400 text-sm mt-2">Comece a registrar seus dias no Daily Journal!</p>
            </div>
          ) : (
            history.map((day) => {
              const isExpanded = expandedDays.has(day.date);
              let exercisesData = [];

              if (day.workout) {
                try {
                  exercisesData = JSON.parse(day.workout.exercises_data);
                } catch (e) {
                  console.error('Erro ao parsear exercícios:', e);
                }
              }

              return (
                <div key={day.date} className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-100 hover:border-indigo-200 transition-all">
                  {/* Header do Dia */}
                  <div className="p-6 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-md">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{formatRelativeDate(day.date)}</h3>
                          <p className="text-gray-600 text-sm font-medium">{formatDateBR(day.date)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditDay(day.date)}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-all font-semibold text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </button>

                        <button
                          onClick={() => toggleDay(day.date)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Summary (sempre visível) */}
                    <div className="mt-4 flex flex-wrap gap-3">
                      {day.completedHabits.length > 0 && (
                        <div className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-semibold">
                          ✅ {day.completedHabits.length} hábito{day.completedHabits.length > 1 ? 's' : ''}
                        </div>
                      )}
                      {day.workout && (
                        <div className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                          💪 {exercisesData.length} exercício{exercisesData.length > 1 ? 's' : ''}
                        </div>
                      )}
                      {day.journal && (
                        <div className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold flex items-center gap-1">
                          📝 Diário {day.journal.mood_rating && (
                            <span className="ml-1">{getMoodEmoji(day.journal.mood_rating)}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Detalhes (expandível) */}
                  {isExpanded && (
                    <div className="p-6 space-y-6 border-t-2 border-gray-100">
                      {/* Hábitos */}
                      {day.completedHabits.length > 0 && (
                        <div>
                          <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <Target className="w-4 h-4 text-green-600" />
                            Hábitos Completados
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {day.completedHabits.map((habit, idx) => (
                              <div key={idx} className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-900">
                                ✓ {habit.habit_name || 'Hábito'}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Treino */}
                      {day.workout && exercisesData.length > 0 && (
                        <div>
                          <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <Dumbbell className="w-4 h-4 text-blue-600" />
                            Treino ({exercisesData.length} exercícios)
                          </h4>
                          <div className="space-y-2">
                            {exercisesData.map((ex, idx) => (
                              <div key={idx} className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm font-semibold text-blue-900">{ex.exercise_name}</p>
                                <p className="text-xs text-blue-700 mt-1">
                                  {ex.sets && `${ex.sets} séries`}
                                  {ex.reps && ` × ${ex.reps} reps`}
                                  {ex.weight && ` × ${ex.weight}kg`}
                                  {ex.time && ` - ${ex.time}`}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Journal */}
                      {day.journal && day.journal.content && (
                        <div>
                          <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-purple-600" />
                            Diário do Dia
                          </h4>
                          <div className="px-4 py-3 bg-purple-50 border border-purple-200 rounded-lg">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{day.journal.content}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Botão para carregar mais */}
        {!loading && history.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setDays(days + 7)}
              className="px-6 py-3 bg-white border-2 border-indigo-200 hover:border-indigo-400 text-indigo-700 font-bold rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              <TrendingUp className="w-5 h-5 inline mr-2" />
              Carregar mais dias
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
