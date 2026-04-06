import { NextResponse } from "next/server";
import mongoose from 'mongoose';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
    // Make sure you replace these with your actual keys if they aren't in your .env
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://salahsalah20191988_db_user:YPru8Kpe4wVsloN5@akram-platform.nl3vlkq.mongodb.net/";
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vbtscwcpollmkeaseslg.supabase.co";
    // If you disabled RLS as instructed, the ANON_KEY works perfectly!
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""; 

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const logs: string[] = [];
    const log = (msg: string) => { console.log(msg); logs.push(msg); };

    try {
        log("Connecting to MongoDB...");
        // Ensure strictQuery warning isn't thrown
        mongoose.set('strictQuery', false);
        await mongoose.connect(MONGODB_URI);
        log("MongoDB Connected!");

        const db = mongoose.connection.db!;
        let totalInserted = 0;

        // ==========================================
        // 1. Migrate Students
        // ==========================================
        log("Migrating Students...");
        const students = await db.collection("students").find({}).toArray();
        const mappedStudents = students.map(s => {
            const classResults = (s.classResults || []).map((cr: any) => ({
                id: null,
                title: cr.title,
                image_urls: cr.imageUrls || [],
                note: cr.note,
                date: cr.date
            }));

            const quizResults = (s.quizResults || []).map((qr: any) => ({
                grade: qr.grade,
                unit_title: qr.unitTitle,
                lesson_title: qr.lessonTitle,
                score: qr.score,
                total_questions: qr.totalQuestions,
                date: qr.date
            }));

            return {
                code: s.code,
                name: s.name,
                age: s.age || null,
                gender: s.gender,
                grade: s.grade,
                phone_number: s.phoneNumber || null,
                profile_image: s.profile_image || s.profileImage || "",
                performance: s.performance || {},
                monthly_payment: s.monthlyPayment || false,
                exams: s.exams || [],
                class_results: classResults,
                quiz_results: quizResults,
                created_at: s.createdAt || new Date(),
                updated_at: s.updatedAt || new Date()
            };
        });

        if (mappedStudents.length > 0) {
            const { error } = await supabase.from('students').insert(mappedStudents);
            if (error) log(`Error inserting students: ${error.message}`);
            else {
                log(`✓ Inserted ${mappedStudents.length} students`);
                totalInserted += mappedStudents.length;
            }
        }

        // ==========================================
        // 2. Migrate Blogs
        // ==========================================
        log("Migrating Blogs...");
        const blogs = await db.collection("blogs").find({}).toArray();
        const mappedBlogs = blogs.map(b => ({
            name: b.name,
            description: b.description,
            grade: b.grade,
            unit: b.unit,
            lesson: b.lesson,
            type: b.type,
            url: b.url || null,
            cover_image: b.coverImage || "",
            video_url: b.videoUrl || null,
            learning_outcomes: b.learningOutcomes || [],
            created_at: b.createdAt || new Date()
        }));

        if (mappedBlogs.length > 0) {
            const { error } = await supabase.from('blogs').insert(mappedBlogs);
            if (error) log(`Error inserting blogs: ${error.message}`);
            else {
                log(`✓ Inserted ${mappedBlogs.length} blogs`);
                totalInserted += mappedBlogs.length;
            }
        }

        // ==========================================
        // 3. Migrate Best of Month
        // ==========================================
        log("Migrating Best Of Month...");
        const bestOfMonth = await db.collection("bestofmonths").find({}).toArray();
        const mappedBest = bestOfMonth.map(b => ({
            name: b.name,
            grade: b.grade,
            description: b.description || "",
            image_url: b.imageUrl || "",
            created_at: b.createdAt || new Date(),
            updated_at: b.updatedAt || new Date()
        }));

        if (mappedBest.length > 0) {
            const { error } = await supabase.from('best_of_month').insert(mappedBest);
            if (error) log(`Error inserting best_of_month: ${error.message}`);
            else {
                log(`✓ Inserted ${mappedBest.length} best_of_month`);
                totalInserted += mappedBest.length;
            }
        }

        // ==========================================
        // 4. Migrate Testimonials
        // ==========================================
        log("Migrating Testimonials...");
        const testimonials = await db.collection("testimonials").find({}).toArray();
        const mappedTestimonials = testimonials.map(t => ({
            name: t.name,
            quote: t.quote,
            designation: t.designation || 'student',
            image_url: t.imageUrl || null,
            created_at: t.createdAt || new Date()
        }));

        if (mappedTestimonials.length > 0) {
            const { error } = await supabase.from('testimonials').insert(mappedTestimonials);
            if (error) log(`Error inserting testimonials: ${error.message}`);
            else {
                log(`✓ Inserted ${mappedTestimonials.length} testimonials`);
                totalInserted += mappedTestimonials.length;
            }
        }

        // ==========================================
        // 5. Migrate Questions
        // ==========================================
        log("Migrating Questions...");
        const questions = await db.collection("questions").find({}).toArray();
        const mappedQuestions = questions.map(q => ({
            grade: q.grade,
            unit_title: q.unitTitle,
            lesson_title: q.lessonTitle,
            question_text: q.questionText,
            image: q.image || null,
            options: q.options || [],
            correct_answer: q.correctAnswer || null,
            question_type: q.questionType || 'mcq',
            external_link: q.externalLink || null,
            file_url: q.fileUrl || null,
            created_at: q.createdAt || new Date()
        }));

        if (mappedQuestions.length > 0) {
            const { error } = await supabase.from('questions').insert(mappedQuestions);
            if (error) log(`Error inserting questions: ${error.message}`);
            else {
                log(`✓ Inserted ${mappedQuestions.length} questions`);
                totalInserted += mappedQuestions.length;
            }
        }

        // ==========================================
        // 6. Migrate Grades
        // ==========================================
        log("Migrating Grades...");
        const grades = await db.collection("grades").find({}).toArray();
        const mappedGrades = grades.map(g => ({
            name: g.name,
            created_at: g.createdAt || new Date()
        }));

        if (mappedGrades.length > 0) {
            const { error } = await supabase.from('grades').insert(mappedGrades);
            if (error) log(`Error inserting grades: ${error.message}`);
            else {
                log(`✓ Inserted ${mappedGrades.length} grades`);
                totalInserted += mappedGrades.length;
            }
        }

        return NextResponse.json({
            success: true,
            totalRowsInserted: totalInserted,
            logs
        });

    } catch (error: any) {
        log(`Migration failed critically: ${error.message}`);
        return NextResponse.json({ success: false, logs, error: error.message }, { status: 500 });
    } finally {
        await mongoose.disconnect();
    }
}
