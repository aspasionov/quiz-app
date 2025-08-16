const mongoose = require('mongoose');
const Tag = require('../models/tag');
const dotenv = require('dotenv');

dotenv.config();

// All the tags that were previously hardcoded
const initialTags = [
  // Programming Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
  
  // Web Development
  'HTML', 'CSS', 'React', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Next.js', 'Nuxt.js', 'Webpack', 'Vite',
  
  // Backend & Databases
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'GraphQL', 'REST API', 'Microservices', 'Docker', 'Kubernetes',
  
  // Cloud & DevOps
  'AWS', 'Azure', 'Google Cloud', 'Firebase', 'Heroku', 'Netlify', 'Vercel', 'CI/CD', 'Git', 'GitHub',
  
  // Data & AI
  'Machine Learning', 'Data Science', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Jupyter', 'SQL',
  
  // Mobile Development
  'React Native', 'Flutter', 'iOS', 'Android', 'Xamarin', 'Ionic',
  
  // Testing & Quality
  'Jest', 'Cypress', 'Selenium', 'Unit Testing', 'Integration Testing', 'TDD', 'BDD',
  
  // English Language & Literature
  'English', 'Grammar', 'Vocabulary', 'Literature', 'Poetry', 'Shakespeare', 'Creative Writing', 'Essay Writing',
  'Reading Comprehension', 'Spelling', 'Punctuation', 'Syntax', 'Phonetics', 'Linguistics', 'Etymology',
  'American Literature', 'British Literature', 'World Literature', 'Modern Literature', 'Classical Literature',
  'Short Stories', 'Novels', 'Drama', 'Theater', 'English Composition', 'Academic Writing', 'Business Writing',
  'Technical Writing', 'Journalism', 'Rhetoric', 'Speech', 'Public Speaking', 'Debate', 'Language Arts',
  'ESL', 'EFL', 'TOEFL', 'IELTS', 'SAT English', 'AP English', 'GRE Verbal', 'English as Second Language',
  'English Proficiency', 'Language Learning', 'English Grammar Rules', 'Parts of Speech', 'Sentence Structure',
  'Paragraph Writing', 'Proofreading', 'Editing', 'Style Guide', 'MLA', 'APA', 'Chicago Style',
  
  // General Topics
  'Algorithms', 'Data Structures', 'Design Patterns', 'System Design', 'Security', 'Performance',
  
  // Difficulty Levels
  'Beginner', 'Intermediate', 'Advanced', 'Expert',
  
  // Categories
  'Frontend', 'Backend', 'Full Stack', 'DevOps', 'Mobile', 'Game Development', 'Cybersecurity',
  
  // Methodologies
  'Agile', 'Scrum', 'Kanban', 'Waterfall', 'Lean',
  
  // Soft Skills
  'Problem Solving', 'Critical Thinking', 'Communication', 'Leadership', 'Teamwork'
];

async function seedTags() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_DB_URI, {
      useNewUrlParser: true,
    });
    console.log('Connected to MongoDB');

    // Check how many tags already exist
    const existingCount = await Tag.countDocuments();
    console.log(`Found ${existingCount} existing tags`);

    if (existingCount > 0) {
      console.log('Tags already exist. Skipping seed...');
      console.log('If you want to reseed, drop the tags collection first.');
      process.exit(0);
    }

    // Create tags
    const tagDocuments = initialTags.map(tagName => ({
      name: tagName,
      count: 0
    }));

    // Insert tags in batches to handle duplicates gracefully
    let successCount = 0;
    let skippedCount = 0;

    for (const tagDoc of tagDocuments) {
      try {
        await Tag.create(tagDoc);
        successCount++;
        console.log(`✓ Created tag: ${tagDoc.name}`);
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate key error - tag already exists
          skippedCount++;
          console.log(`- Skipped existing tag: ${tagDoc.name}`);
        } else {
          console.error(`✗ Error creating tag ${tagDoc.name}:`, error.message);
        }
      }
    }

    console.log('\n=== Seed Summary ===');
    console.log(`Total tags to create: ${initialTags.length}`);
    console.log(`Successfully created: ${successCount}`);
    console.log(`Skipped (already exist): ${skippedCount}`);
    console.log(`Errors: ${initialTags.length - successCount - skippedCount}`);

    const finalCount = await Tag.countDocuments();
    console.log(`Total tags in database: ${finalCount}`);
    
    console.log('\nTag seeding completed!');
  } catch (error) {
    console.error('Error seeding tags:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Run the seeding function
seedTags();
