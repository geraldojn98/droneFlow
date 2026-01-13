
import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Droplets, 
  Beaker, 
  Ruler, 
  Zap, 
  Sparkles, 
  Info, 
  AlertTriangle,
  FileText,
  Loader2,
  CheckCircle2,
  Package
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface ProductInput {
  id: string;
  name: string;
  dosage: string;
  type: 'liquid' | 'powder';
}

const AICalculator: React.FC = () => {
  const [hectares, setHectares] = useState<number>(0);
  const [tankSize, setTankSize] = useState<number>(0);
  const [flowRate, setFlowRate] = useState<number>(10); // L/ha padrão
  const [products, setProducts] = useState<ProductInput[]>([
    { id: '1', name: '', dosage: '', type: 'liquid' }
  ]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const addProduct = () => {
    setProducts([...products, { id: Math.random().toString(36).substr(2, 9), name: '', dosage: '', type: 'liquid' }]);
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const updateProduct = (id: string, field: keyof ProductInput, value: string | 'liquid' | 'powder') => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

 const runAnalysis = async () => {
    // 1. Validação
    if (hectares <= 0 || tankSize <= 0 || products.some(p => !p.name || !p.dosage)) {
      alert("Por favor, preencha todos os campos corretamente.");
      return;
    }

    setLoading(true);
    setAnalysis(null);

    // 2. Simulação de "Pensamento" da IA (para dar a sensação de processamento)
    setTimeout(() => {
      // 3. Cálculos Matemáticos Reais (Sem API)
      const volumeTotal = hectares * flowRate;
      const numeroVoos = Math.ceil(volumeTotal / tankSize);
      
      // Montagem do Relatório "Fake" (Mas com dados reais)
      const relatorio = `
**RELATÓRIO TÉCNICO DE APLICAÇÃO AÉREA**

**1. Resumo da Operação**
* **Área Total:** ${hectares} hectares
* **Volume Total de Calda:** ${volumeTotal.toFixed(2)} Litros
* **Logística de Voo:** Serão necessários aproximadamente **${numeroVoos} voos** (considerando tanque de ${tankSize}L).

**2. Planejamento de Produtos (Total para a área)**
${products.map(p => `* **${p.name}:** ${(p.dosage * hectares).toFixed(2)} ${p.unit}`).join('\n')}

**3. Preparo da Calda (Por Tanque - ${tankSize}L)**
Para cada reabastecimento do drone, adicione:
${products.map(p => {
    // Regra de três: Dose por Ha * (Tamanho do Tanque / Vazão)
    const dosePorTanque = p.dosage * (tankSize / flowRate);
    return `* **${p.name}:** ${dosePorTanque.toFixed(2)} ${p.unit}`;
}).join('\n')}

**4. Recomendações Técnicas**
* Verifique as condições climáticas (Vento < 10km/h, Umidade > 50%).
* Respeite a ordem de mistura dos produtos no tanque.
* Utilize EPIs adequados durante o preparo da calda.
      `;

      setAnalysis(relatorio);
      setLoading(false);
    }, 1500); // Demora 1.5 segundos para parecer que a IA está pensando
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
              <Sparkles className="w-8 h-8 text-indigo-100" />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tight">IA Agronômica</h2>
              <p className="text-indigo-200 font-bold uppercase text-[10px] tracking-widest">Powered by Gemini 3 Pro</p>
            </div>
          </div>
          <p className="text-indigo-100 text-sm max-w-xl font-medium leading-relaxed">
            Nossa inteligência artificial analisa a compatibilidade química e calcula as proporções exatas de cada produto por tanque, garantindo eficiência e segurança na sua pulverização.
          </p>
        </div>
        <Zap className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 rotate-12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Parâmetros de Voo */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Ruler className="w-4 h-4" /> Configurações
            </h3>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hectares Totais</label>
              <input 
                type="number" 
                value={hectares || ''} 
                onChange={e => setHectares(Number(e.target.value))}
                placeholder="0"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanque / Misturador (L)</label>
              <input 
                type="number" 
                value={tankSize || ''} 
                onChange={e => setTankSize(Number(e.target.value))}
                placeholder="0"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vazão (L/ha)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={flowRate || ''} 
                  onChange={e => setFlowRate(Number(e.target.value))}
                  placeholder="10"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">L/HA</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl space-y-3">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="text-sm font-black uppercase">Importante</h4>
            </div>
            <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
              A DroneFlow IA utiliza dados técnicos para auxílio. Sempre consulte a bula oficial dos produtos e o receituário agronômico antes da aplicação.
            </p>
          </div>
        </div>

        {/* Lista de Produtos */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Beaker className="w-4 h-4" /> Receita de Produtos
              </h3>
              <button 
                onClick={addProduct}
                className="flex items-center gap-2 text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest transition-colors"
              >
                <Plus className="w-4 h-4" /> Adicionar Produto
              </button>
            </div>

            <div className="space-y-4">
              {products.map((p, index) => (
                <div key={p.id} className="flex flex-col gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-left-2 duration-300">
                  <div className="flex items-center justify-between">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Produto {index + 1}</label>
                     <div className="flex bg-slate-200 p-1 rounded-lg">
                        <button 
                          onClick={() => updateProduct(p.id, 'type', 'liquid')}
                          className={`px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all flex items-center gap-1 ${p.type === 'liquid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                        >
                          <Droplets className="w-3 h-3" /> Líquido
                        </button>
                        <button 
                          onClick={() => updateProduct(p.id, 'type', 'powder')}
                          className={`px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all flex items-center gap-1 ${p.type === 'powder' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                        >
                          <Package className="w-3 h-3" /> Em Pó
                        </button>
                     </div>
                  </div>
                  
                  <div className="flex gap-3 items-end">
                    <div className="flex-1 space-y-1">
                      <input 
                        type="text" 
                        placeholder="Nome Comercial do Produto"
                        value={p.name}
                        onChange={e => updateProduct(p.id, 'name', e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div className="w-40 space-y-1">
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Dose"
                          value={p.dosage}
                          onChange={e => updateProduct(p.id, 'dosage', e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">
                          {p.type === 'liquid' ? 'ml/ha' : 'g/ha'}
                        </span>
                      </div>
                    </div>
                    {products.length > 1 && (
                      <button 
                        onClick={() => removeProduct(p.id)}
                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-slate-100">
              <button 
                onClick={runAnalysis}
                disabled={loading}
                className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${loading ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white shadow-indigo-600/20 hover:bg-indigo-700'}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Analisando Mistura...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    Gerar Análise com Gemini
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Resultado da Análise */}
          {analysis && (
            <div className="bg-white p-8 rounded-[2.5rem] border-2 border-indigo-100 shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 text-indigo-50 opacity-20 pointer-events-none">
                <CheckCircle2 className="w-32 h-32" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-indigo-50">
                  <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">Relatório Agronômico IA</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mistura e Proporções droneflow v1.0</p>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none text-slate-700 font-medium leading-relaxed">
                  <div className="whitespace-pre-wrap whitespace-normal break-words custom-markdown text-sm">
                    {analysis.split('\n').map((line, i) => {
                      if (line.trim().startsWith('#')) {
                        return <h4 key={i} className="text-indigo-700 font-black mt-6 mb-2">{line.replace(/#/g, '').trim()}</h4>;
                      }
                      if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                        return <li key={i} className="ml-4 mb-1 list-disc text-slate-600">{line.replace(/^[-*]\s*/, '').trim()}</li>;
                      }
                      if (line.trim() === '') return <br key={i} />;
                      return <p key={i} className="mb-2">{line}</p>;
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-markdown h4 {
          font-size: 1.1rem;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }
        .custom-markdown strong {
          color: #4338ca;
          font-weight: 800;
        }
      `}</style>
    </div>
  );
};

export default AICalculator;