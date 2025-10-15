export interface verificacion {
  id_verificacion: number;
  id_usuario: number;
  codigo: string;
  expira_en: Date;
  verificado: boolean;
  creado_at: Date;
}