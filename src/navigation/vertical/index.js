export default [
  {
    title: 'Estadisticas',
    to: { name: 'dashboard' },
    permission: "all",
    icon: { icon: 'ri-bar-chart-2-line' },
  },
  {
    title: 'Tasa del Día',
    to: { name: 'settings-exchange-rate' },
    permission: 'view_exchange_rate',
    icon: { icon: 'ri-money-dollar-circle-line' },
  },
  {
    title: 'Registro Diario',
    icon: { icon: 'ri-time-line' },
    children: [
      {
        title: 'Listado',
        to: { name: 'pet-daily-list' },
        permission: 'list_pet',
        icon: { icon: 'ri-radio-button-line' },
      },
      {
        title: 'Registrar',
        to: { name: 'pet-daily-add' },
        permission: 'register_pet',
        icon: { icon: 'ri-radio-button-line' },
      },
    ],
  },
  { heading: 'Accesos', permissions: ['list_rol', 'list_staff'] },
  {
    title: 'Roles y Permisos',
    to: { name: 'roles-y-permisos' },
    permission: 'list_rol',
    icon: { icon: 'ri-lock-password-line' },
  },
  {
    title: 'Personal',
    to: { name: 'staffs' },
    permission: 'list_staff',
    icon: { icon: 'ri-group-line' },
  },
  { heading: 'Gestion', permissions: ['register_veterinary', 'list_veterinary', 'register_pet', 'list_pet', 'list_grooming'] },
  {
    title: 'Veterinario',
    icon: { icon: 'ri-nurse-fill' },
    children: [
      {
        title: 'Registrar',
        to: 'veterinarie-add',
        permission: 'register_veterinary',
        icon: { icon: 'ri-radio-button-line' },
      },
      {
        title: 'Listado',
        to: 'veterinarie-list',
        permission: 'list_veterinary',
        icon: { icon: 'ri-radio-button-line' },
      },
    ],
  },
  {
    title: 'Mascotas',
    icon: { icon: 'ri-skull-2-line' },
    children: [
      {
        title: 'Registrar',
        to: 'pet-add',
        permission: 'register_pet',
        icon: { icon: 'ri-radio-button-line' },
      },
      {
        title: 'Listado',
        to: 'pet-list',
        permission: 'list_pet',
        icon: { icon: 'ri-radio-button-line' },
      },
    ],
  },
  {
    title: 'Peluquería',
    icon: { icon: 'ri-scissors-2-line' },
    children: [
      {
        title: 'Registrar',
        to: 'grooming-add',
        permission: 'register_grooming',
        icon: { icon: 'ri-radio-button-line' },
      },
      {
        title: 'Listado',
        to: 'grooming-list',
        permission: 'list_grooming',
        icon: { icon: 'ri-radio-button-line' },
      },
    ],
  },
  { heading: 'Agenda', permissions: ['register_appointment', 'list_appointment', 'calendar', 'register_surgeries', 'list_surgeries', 'show_medical_records', 'list_client_scheduling'] },
  {
    title: 'Citas',
    icon: { icon: 'ri-list-check-3' },
    children: [
      {
        title: 'Registrar',
        to: 'appointment-add',
        permission: 'register_appointment',
        icon: { icon: 'ri-radio-button-line' },
      },
      {
        title: 'Listado',
        to: 'appointment-list',
        permission: 'list_appointment',
        icon: { icon: 'ri-radio-button-line' },
      },
    ],
  },

  {
    title: 'Cirugías',
    icon: { icon: 'ri-microscope-line' },
    children: [
      {
        title: 'Registrar',
        to: 'surgerie-add',
        permission: 'register_surgeries',
        icon: { icon: 'ri-radio-button-line' },
      },
      {
        title: 'Listado',
        to: 'surgerie-list',
        permission: 'list_surgeries',
        icon: { icon: 'ri-radio-button-line' },
      },
    ],
  },
  {
    title: 'Historial Medico',
    to: { name: 'medical-record' },
    icon: { icon: 'ri-draft-line' },
    permission: 'show_medical_records',
  },
  {
    title: 'Agendamiento de Cliente',
    to: { name: 'client-scheduling' },
    icon: { icon: 'ri-customer-service-2-line' },
    permission: 'list_client_scheduling',
  },
  { heading: 'Tienda', permissions: ['register_product', 'list_product', 'pos_sales', 'list_sales'] },
  {
    title: 'Inventario',
    icon: { icon: 'ri-store-2-line' },
    children: [
      {
        title: 'Registrar Producto',
        to: { name: 'inventory-add' },
        permission: 'register_product',
        icon: { icon: 'ri-radio-button-line' },
      },
      {
        title: 'Listado de Productos',
        to: { name: 'inventory-list' },
        permission: 'list_product',
        icon: { icon: 'ri-radio-button-line' },
      },
      {
        title: 'Nueva Venta / POS',
        to: { name: 'pos' },
        permission: 'pos_sales',
        icon: { icon: 'ri-radio-button-line' },
      },
      {
        title: 'Historial de Ventas',
        to: { name: 'sales-history' },
        permission: 'list_sales',
        icon: { icon: 'ri-radio-button-line' },
      },
    ],
  },
  {
    title: 'Pagos',
    icon: { icon: 'ri-coins-line' },
    permission: 'show_payment',
    to: 'payments-list',
  },
  { heading: 'Sistema', permissions: ['manage_settings'] },
  {
    title: 'Configuraciones',
    icon: { icon: 'ri-settings-4-line' },
    children: [
      {
        title: 'Notificaciones WhatsApp',
        to: { name: 'settings-notifications' },
        icon: { icon: 'ri-whatsapp-fill' },
        permission: 'manage_settings',
      },
      {
        title: 'Landing Page',
        to: { name: 'settings-landing' },
        icon: { icon: 'ri-window-line' },
        permission: 'manage_settings',
      },
    ],
    permission: 'manage_settings',
  },
]
