export interface diagnostico {
  id_diagnostico: number;
  id_topico: number;
  id_diagnosticador: number;
  nota_diagn: number | null;
  descripcion: string | null;
  fecha_diagnostico: string;
}
