import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './shared/schema';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name using ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  try {
    console.log('Connecting to Supabase database...');
    const client = postgres(process.env.DATABASE_URL, { 
      ssl: { rejectUnauthorized: false },
      max: 1,
      connect_timeout: 15,  // Increase connection timeout
      idle_timeout: 30,     // Adjust idle timeout
      prepare: false        // Disable prepared statements for better Supabase compatibility
    });
    
    const db = drizzle(client, { schema });

    // Read migration SQL
    const migrationPath = path.join(__dirname, 'migrations', '0000_lying_hardball.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');

    // Split the SQL into individual statements
    const statements = migrationSql.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s);

    console.log(`Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        // Skip if it's a comment or empty line
        if (!statement || statement.startsWith('--')) continue;
        
        console.log(`Executing statement ${i + 1}/${statements.length}`);
        await client.unsafe(statement);
        console.log(`Statement ${i + 1} executed successfully`);
      } catch (error: any) {
        // If the error is about the table/type already existing, we can continue
        if (error.message.includes('already exists')) {
          console.log(`Skipping statement ${i + 1} - object already exists`);
          continue;
        }
        console.error(`Error executing statement ${i + 1}:`, error);
        throw error;
      }
    }

    // Test: Create a test university
    const testUniversity = {
      name: 'جامعة دمشق',
      location: 'دمشق، سوريا',
      logo: 'https://upload.wikimedia.org/wikipedia/ar/thumb/3/31/%D8%AC%D8%A7%D9%85%D8%B9%D8%A9_%D8%AF%D9%85%D8%B4%D9%82.png/220px-%D8%AC%D8%A7%D9%85%D8%B9%D8%A9_%D8%AF%D9%85%D8%B4%D9%82.png',
      website: 'http://damascusuniversity.edu.sy/'
    };

    try {
      const result = await db.insert(schema.universities).values(testUniversity).returning();
      console.log('Test university created:', result[0]);
    } catch (error: any) {
      // If it's a unique constraint violation, the university already exists
      if (error.message.includes('duplicate key')) {
        console.log('Test university already exists, skipping creation');
      } else {
        console.error('Error creating test university:', error);
      }
    }

    // Test: Create test users (admin, teacher, student)
    const testUsers = [
      {
        username: 'admin',
        email: 'admin@qasyounextra.com',
        password: 'adminpassword',
        role: 'admin' as const, 
        fullName: 'مدير النظام',
        bio: 'مدير منصة قاسيون إكسترا'
      },
      {
        username: 'teacher',
        email: 'teacher@qasyounextra.com',
        password: 'teacherpassword',
        role: 'teacher' as const,
        fullName: 'أستاذ نموذجي',
        bio: 'أستاذ في كلية الهندسة المعلوماتية',
        faculty: 'engineering' as const
      },
      {
        username: 'student',
        email: 'student@qasyounextra.com',
        password: 'studentpassword',
        role: 'student' as const,
        fullName: 'طالب نموذجي',
        faculty: 'engineering' as const,
        academicYear: 'third' as const,
        studentId: '12345'
      }
    ];

    for (const user of testUsers) {
      try {
        const result = await db.insert(schema.users).values(user).returning();
        console.log(`Test user ${user.username} created:`, result[0]);
      } catch (error: any) {
        // If it's a unique constraint violation, the user already exists
        if (error.message.includes('duplicate key')) {
          console.log(`Test user ${user.username} already exists, skipping creation`);
        } else {
          console.error(`Error creating test user ${user.username}:`, error);
        }
      }
    }

    // Verify tables were created
    console.log('Verifying database tables...');
    try {
      const tablesResult = await client`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      
      console.log('Tables in database:');
      tablesResult.forEach((row: any) => {
        console.log(`- ${row.table_name}`);
      });
      
      // Check for expected tables
      const expectedTables = [
        'universities', 'users', 'categories', 'courses', 
        'materials', 'enrollments', 'reviews', 'messages'
      ];
      
      const missingTables = expectedTables.filter(
        table => !tablesResult.some((row: any) => row.table_name === table)
      );
      
      if (missingTables.length > 0) {
        console.warn('Warning: Some expected tables are missing:', missingTables);
      } else {
        console.log('All expected tables are present in the database.');
      }
    } catch (error) {
      console.error('Error verifying tables:', error);
    }

    console.log('Migration completed successfully');
    
    // Close the connection
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();