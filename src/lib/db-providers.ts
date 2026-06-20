// Database provider types and configurations

export type DbProvider = 'sqlite' | 'supabase' | 'mongodb' | 'neon' | 'turso' | 'upstash'

export interface DbProviderConfig {
  id: DbProvider
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  icon: string
  color: string
  fields: DbField[]
  websiteUrl: string
  requiresExternalService: boolean
}

export interface DbField {
  key: string
  label: string
  labelAr: string
  type: 'text' | 'password' | 'url' | 'number'
  placeholder: string
  placeholderAr: string
  required: boolean
  helperText?: string
  helperTextAr?: string
}

export const DB_PROVIDERS: DbProviderConfig[] = [
  {
    id: 'sqlite',
    name: 'SQLite',
    nameAr: 'SQLite',
    description: 'Local file-based database',
    descriptionAr: 'قاعدة بيانات محلية محفوظة في ملفات',
    icon: '📁',
    color: 'emerald',
    requiresExternalService: false,
    websiteUrl: '',
    fields: []
  },
  {
    id: 'supabase',
    name: 'Supabase',
    nameAr: 'سوبابيس',
    description: 'PostgreSQL with real-time capabilities',
    descriptionAr: 'PostgreSQL مع قدرات الوقت الفعلي',
    icon: '🦘',
    color: 'emerald',
    requiresExternalService: true,
    websiteUrl: 'https://supabase.com',
    fields: [
      {
        key: 'supabaseUrl',
        label: 'Supabase URL',
        labelAr: 'رابط Supabase',
        type: 'url',
        placeholder: 'https://xxxxx.supabase.co',
        placeholderAr: 'https://xxxxx.supabase.co',
        required: true,
        helperText: 'Find this in your Supabase project settings',
        helperTextAr: 'تجد هذا في إعدادات مشروع Supabase'
      },
      {
        key: 'supabaseKey',
        label: 'Supabase Key',
        labelAr: 'مفتاح Supabase',
        type: 'password',
        placeholder: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        placeholderAr: 'أدخل المفتاح هنا',
        required: true,
        helperText: 'Use the anon key for client-side, or service key for admin',
        helperTextAr: 'استخدم anon key للعميل أو service key للأدمن'
      },
      {
        key: 'supabaseServiceKey',
        label: 'Service Role Key',
        labelAr: 'مفتاح Service Role',
        type: 'password',
        placeholder: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        placeholderAr: 'أدخل المفتاح هنا',
        required: true,
        helperText: 'Only for server-side operations',
        helperTextAr: 'لعمليات السيرفر فقط'
      }
    ]
  },
  {
    id: 'mongodb',
    name: 'MongoDB Atlas',
    nameAr: 'MongoDB Atlas',
    description: 'Document database with rich querying',
    descriptionAr: 'قاعدة بيانات وثائق مع إمكانيات استعلام متقدمة',
    icon: '🍃',
    color: 'green',
    requiresExternalService: true,
    websiteUrl: 'https://www.mongodb.com/atlas',
    fields: [
      {
        key: 'mongodbUri',
        label: 'MongoDB Connection URI',
        labelAr: 'رابط الاتصال MongoDB',
        type: 'text',
        placeholder: 'mongodb+srv://username:password@cluster.mongodb.net',
        placeholderAr: 'mongodb+srv://اسم_المستخدم:كلمة_المرور@cluster.mongodb.net',
        required: true,
        helperText: 'Get this from your MongoDB Atlas cluster',
        helperTextAr: 'احصل على هذا من مجموعتك في MongoDB Atlas'
      },
      {
        key: 'mongodbDbName',
        label: 'Database Name',
        labelAr: 'اسم قاعدة البيانات',
        type: 'text',
        placeholder: 'gelvano',
        placeholderAr: 'gelvano',
        required: true,
        helperText: 'The name of your database',
        helperTextAr: 'اسم قاعدة البيانات الخاصة بك'
      }
    ]
  },
  {
    id: 'neon',
    name: 'Neon',
    nameAr: 'Neon',
    description: 'Serverless PostgreSQL',
    descriptionAr: 'PostgreSQL بدون سيرفر',
    icon: '⚡',
    color: 'teal',
    requiresExternalService: true,
    websiteUrl: 'https://neon.tech',
    fields: [
      {
        key: 'neonConnectionString',
        label: 'Connection String',
        labelAr: 'رابط الاتصال',
        type: 'text',
        placeholder: 'postgresql://username:password@ep-xxx.region.aws.neon.tech/gelvano',
        placeholderAr: 'postgresql://اسم_المستخدم:كلمة_المرور@ep-xxx.region.aws.neon.tech/gelvano',
        required: true,
        helperText: 'Find this in your Neon project dashboard',
        helperTextAr: 'تجد هذا في لوحة تحكم مشروع Neon'
      }
    ]
  },
  {
    id: 'turso',
    name: 'Turso',
    nameAr: 'Turso',
    description: 'Edge-hosted SQLite',
    descriptionAr: 'SQLite مستضافة على الحافة',
    icon: '🟣',
    color: 'purple',
    requiresExternalService: true,
    websiteUrl: 'https://turso.tech',
    fields: [
      {
        key: 'tursoDbUrl',
        label: 'Database URL',
        labelAr: 'رابط قاعدة البيانات',
        type: 'url',
        placeholder: 'libsql://your-db.turso.io',
        placeholderAr: 'libsql://قاعدة_بياناتك.turso.io',
        required: true,
        helperText: 'Your Turso database URL',
        helperTextAr: 'رابط قاعدة البيانات في Turso'
      },
      {
        key: 'tursoAuthToken',
        label: 'Auth Token',
        labelAr: 'رمز المصادقة',
        type: 'password',
        placeholder: 'eyJhbGciOi...',
        placeholderAr: 'أدخل رمز المصادقة',
        required: true,
        helperText: 'Get this from your Turso dashboard',
        helperTextAr: 'احصل على هذا من لوحة Turbo'
      }
    ]
  },
  {
    id: 'upstash',
    name: 'Upstash',
    nameAr: 'Upstash',
    description: 'Serverless Redis & Kafka',
    descriptionAr: 'Redis و Kafka بدون سيرفر',
    icon: '🔴',
    color: 'red',
    requiresExternalService: true,
    websiteUrl: 'https://upstash.com',
    fields: [
      {
        key: 'upstashRedisUrl',
        label: 'Redis URL',
        labelAr: 'رابط Redis',
        type: 'url',
        placeholder: 'redis://default:xxxx@xxx.upstash.io:6379',
        placeholderAr: 'redis://default:xxxx@xxx.upstash.io:6379',
        required: true,
        helperText: 'Get this from your Upstash Redis console',
        helperTextAr: 'احصل على هذا من وحدة تحكم Upstash Redis'
      },
      {
        key: 'upstashRedisToken',
        label: 'Redis Token',
        labelAr: 'رمز Redis',
        type: 'password',
        placeholder: 'xxxxxxx',
        placeholderAr: 'أدخل الرمز',
        required: true,
        helperText: 'Your Upstash Redis token',
        helperTextAr: 'رمز Upstash Redis الخاص بك'
      }
    ]
  }
]

export function getDbProviderById(id: string): DbProviderConfig | undefined {
  return DB_PROVIDERS.find(p => p.id === id)
}
