import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Iniciando seed do banco de dados...");

    // Limpar dados existentes (opcional - remova se não quiser limpar)
    await cleanup();

    // Criar usuários e perfis
    const users = await createUsers();

    // Criar escolas
    const schools = await createSchools(users);

    // Associar professores às escolas
    await associateTeachersToSchools(users, schools);

    // Criar salas de aula
    const classrooms = await createClassrooms(schools);

    // Criar estudantes
    const students = await createStudents(schools, users);

    // Criar PEIs
    await createPEIs(students, users);

    // Criar notas
    await createNotes(students, users);

    // Criar planos semanais
    await createWeeklyPlans(students, users);

    // Criar assinaturas
    await createSubscriptions(users);

    console.log("✅ Seed concluído com sucesso!");
}

async function cleanup() {
    console.log("🧹 Limpando dados existentes...");

    await prisma.auditLog.deleteMany();
    await prisma.aIRequest.deleteMany();
    await prisma.subscriptionFeature.deleteMany();
    await prisma.subscriptionLimit.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.weeklyPlan.deleteMany();
    await prisma.note.deleteMany();
    await prisma.pEI.deleteMany();
    await prisma.classroomAssignment.deleteMany();
    await prisma.student.deleteMany();
    await prisma.classroom.deleteMany();
    await prisma.school.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.user.deleteMany();
}

async function createUsers() {
    console.log("👥 Criando usuários...");

    const hashedPassword = await hash("11111111", 10);

    // Primeiro criar apenas o diretor
    const director = await prisma.user.create({
        data: {
            fullName: "João Silva",
            email: "joao.silva@escola.com",
            password: hashedPassword,
            profile: {
                create: {
                    role: "DIRECTOR",
                    avatarUrl:
                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
                },
            },
        },
        include: { profile: true },
    });

    if (!director.profile) {
        throw new Error("Perfil do diretor não foi criado");
    }

    // Depois criar os professores, sendo criados pelo diretor
    // Nota: Os professores serão associados às escolas depois que as escolas forem criadas
    const teachers = await Promise.all([
        prisma.user.create({
            data: {
                fullName: "Maria Santos",
                email: "maria.santos@escola.com",
                password: hashedPassword,
                profile: {
                    create: {
                        role: "TEACHER",
                        avatarUrl:
                            "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
                        createdById: director.profile.id,
                    },
                },
            },
            include: { profile: true },
        }),

        prisma.user.create({
            data: {
                fullName: "Pedro Oliveira",
                email: "pedro.oliveira@escola.com",
                password: hashedPassword,
                profile: {
                    create: {
                        role: "TEACHER",
                        avatarUrl:
                            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
                        createdById: director.profile.id,
                    },
                },
            },
            include: { profile: true },
        }),

        prisma.user.create({
            data: {
                fullName: "Ana Costa",
                email: "ana.costa@escola.com",
                password: hashedPassword,
                profile: {
                    create: {
                        role: "TEACHER",
                        avatarUrl:
                            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
                        createdById: director.profile.id,
                    },
                },
            },
            include: { profile: true },
        }),
    ]);

    const users = [director, ...teachers];

    console.log(`✅ ${users.length} usuários criados`);
    return users;
}

async function associateTeachersToSchools(users: any[], schools: any[]) {
    console.log("🏫 Associando professores às escolas...");

    const teachers = users.filter((u) => u.profile.role === "TEACHER");

    if (teachers.length === 0) {
        console.log("⚠️ Nenhum professor encontrado para associar");
        return;
    }

    // Distribuir professores entre as escolas
    await Promise.all([
        // Professor 1 (Maria Santos) -> Escola 1
        prisma.profile.update({
            where: { id: teachers[0].profile.id },
            data: { schoolId: schools[0].id },
        }),

        // Professor 2 (Pedro Oliveira) -> Escola 1
        prisma.profile.update({
            where: { id: teachers[1].profile.id },
            data: { schoolId: schools[0].id },
        }),

        // Professor 3 (Ana Costa) -> Escola 2
        prisma.profile.update({
            where: { id: teachers[2].profile.id },
            data: { schoolId: schools[1].id },
        }),
    ]);

    console.log(`✅ ${teachers.length} professores associados às escolas`);
}

async function createSchools(users: any[]) {
    console.log("🏫 Criando escolas...");

    const director = users.find((u) => u.profile.role === "DIRECTOR");

    if (!director) {
        throw new Error("Diretor não encontrado");
    }

    const schools = await Promise.all([
        prisma.school.create({
            data: {
                name: "Escola Municipal São José",
                address: "Rua das Flores, 123 - Centro",
                createdById: director.profile.id,
            },
        }),

        prisma.school.create({
            data: {
                name: "Escola Estadual Dom Pedro II",
                address: "Av. Principal, 456 - Bairro Novo",
                createdById: director.profile.id,
            },
        }),
    ]);

    console.log(`✅ ${schools.length} escolas criadas`);
    return schools;
}

async function createClassrooms(schools: any[]) {
    console.log("🏠 Criando salas de aula...");

    const director = await prisma.profile.findFirst({
        where: { role: "DIRECTOR" },
    });

    if (!director) {
        throw new Error("Diretor não encontrado");
    }

    const classrooms = await Promise.all([
        // Escola 1 - Manhã
        prisma.classroom.create({
            data: {
                name: "1º Ano A",
                grade: "1º Ano",
                period: "MORNING",
                capacity: 25,
                schoolId: schools[0].id,
                createdById: director.id,
            },
        }),

        prisma.classroom.create({
            data: {
                name: "2º Ano A",
                grade: "2º Ano",
                period: "MORNING",
                capacity: 25,
                schoolId: schools[0].id,
                createdById: director.id,
            },
        }),

        prisma.classroom.create({
            data: {
                name: "3º Ano A",
                grade: "3º Ano",
                period: "AFTERNOON",
                capacity: 25,
                schoolId: schools[0].id,
                createdById: director.id,
            },
        }),

        // Escola 2 - Manhã
        prisma.classroom.create({
            data: {
                name: "1º Ano B",
                grade: "1º Ano",
                period: "MORNING",
                capacity: 25,
                schoolId: schools[1].id,
                createdById: director.id,
            },
        }),

        prisma.classroom.create({
            data: {
                name: "2º Ano B",
                grade: "2º Ano",
                period: "AFTERNOON",
                capacity: 25,
                schoolId: schools[1].id,
                createdById: director.id,
            },
        }),
    ]);

    console.log(`✅ ${classrooms.length} salas de aula criadas`);
    return classrooms;
}

async function createStudents(schools: any[], users: any[]) {
    console.log("👶 Criando estudantes...");

    const teachers = users.filter((u) => u.profile.role === "TEACHER");

    if (teachers.length === 0) {
        throw new Error("Nenhum professor encontrado para criar estudantes");
    }

    const students = await Promise.all([
        // Estudante 1 - Criado pelo Professor 1 (Maria Santos)
        prisma.student.create({
            data: {
                fullName: "Lucas Mendes",
                photoUrl:
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
                dateOfBirth: new Date("2017-03-15"),
                schoolId: schools[0].id,
                specialNeeds: "Dificuldades de aprendizagem em matemática",
                medicalConditions: "Alergia a poeira",
                hasCamping: true,
                parentGuardian: "Maria Mendes",
                cid: "CID-001",
                gender: "MALE",
                status: "ACTIVE",
                createdById: teachers[0].profile.id,
            },
        }),

        // Estudante 2 - Criado pelo Professor 1 (Maria Santos)
        prisma.student.create({
            data: {
                fullName: "Sofia Rodrigues",
                photoUrl:
                    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
                dateOfBirth: new Date("2016-08-22"),
                schoolId: schools[0].id,
                specialNeeds: "Transtorno do espectro autista",
                medicalConditions: null,
                hasCamping: false,
                parentGuardian: "Carlos Rodrigues",
                cid: "CID-002",
                gender: "FEMALE",
                status: "ACTIVE",
                createdById: teachers[0].profile.id,
            },
        }),

        // Estudante 3 - Criado pelo Professor 2 (Pedro Oliveira)
        prisma.student.create({
            data: {
                fullName: "Gabriel Almeida",
                photoUrl:
                    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
                dateOfBirth: new Date("2017-11-10"),
                schoolId: schools[0].id,
                specialNeeds: "Déficit de atenção",
                medicalConditions: "Asma",
                hasCamping: true,
                parentGuardian: "Fernanda Almeida",
                cid: "CID-003",
                gender: "MALE",
                status: "ACTIVE",
                createdById: teachers[1].profile.id,
            },
        }),

        // Estudante 4 - Criado pelo Professor 3 (Ana Costa)
        prisma.student.create({
            data: {
                fullName: "Isabella Ferreira",
                photoUrl:
                    "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
                dateOfBirth: new Date("2016-05-18"),
                schoolId: schools[1].id,
                specialNeeds: "Dificuldades motoras finas",
                medicalConditions: null,
                hasCamping: false,
                parentGuardian: "Roberto Ferreira",
                cid: "CID-004",
                gender: "FEMALE",
                status: "ACTIVE",
                createdById: teachers[2].profile.id,
            },
        }),

        // Estudante 5 - Criado pelo Professor 3 (Ana Costa)
        prisma.student.create({
            data: {
                fullName: "Matheus Lima",
                photoUrl:
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
                dateOfBirth: new Date("2017-01-30"),
                schoolId: schools[1].id,
                specialNeeds: "Dificuldades de leitura e escrita",
                medicalConditions: "Alergia alimentar",
                hasCamping: true,
                parentGuardian: "Patrícia Lima",
                cid: "CID-005",
                gender: "MALE",
                status: "ACTIVE",
                createdById: teachers[2].profile.id,
            },
        }),
    ]);

    // Criar atribuições de sala de aula
    const classrooms = await prisma.classroom.findMany();
    const teacherProfiles = teachers.map((t) => t.profile);

    await Promise.all([
        prisma.classroomAssignment.create({
            data: {
                studentId: students[0].id,
                teacherId: teacherProfiles[0].id,
                classroomId: classrooms[0].id,
                status: "ACTIVE",
            },
        }),

        prisma.classroomAssignment.create({
            data: {
                studentId: students[1].id,
                teacherId: teacherProfiles[0].id,
                classroomId: classrooms[0].id,
                status: "ACTIVE",
            },
        }),

        prisma.classroomAssignment.create({
            data: {
                studentId: students[2].id,
                teacherId: teacherProfiles[1].id,
                classroomId: classrooms[1].id,
                status: "ACTIVE",
            },
        }),

        prisma.classroomAssignment.create({
            data: {
                studentId: students[3].id,
                teacherId: teacherProfiles[2].id,
                classroomId: classrooms[3].id,
                status: "ACTIVE",
            },
        }),

        prisma.classroomAssignment.create({
            data: {
                studentId: students[4].id,
                teacherId: teacherProfiles[2].id,
                classroomId: classrooms[4].id,
                status: "ACTIVE",
            },
        }),
    ]);

    console.log(`✅ ${students.length} estudantes criados`);
    return students;
}

async function createPEIs(students: any[], users: any[]) {
    console.log("📋 Criando PEIs...");

    const teachers = users.filter((u) => u.profile.role === "TEACHER");

    const peis = await Promise.all([
        prisma.pEI.create({
            data: {
                studentId: students[0].id,
                version: 1,
                content:
                    "PEI desenvolvido para atender às necessidades específicas do aluno Lucas Mendes, com foco em matemática e desenvolvimento de habilidades cognitivas.",
                formQuestions: {
                    objetivos: [
                        "Melhorar habilidades matemáticas",
                        "Desenvolver concentração",
                    ],
                    metodologias: ["Aulas individuais", "Exercícios práticos"],
                    recursos: ["Calculadora", "Material concreto"],
                },
                startDate: new Date("2024-01-15"),
                endDate: new Date("2024-12-15"),
                status: "ACTIVE",
                createdById: teachers[0].profile.id,
                isRenewal: false,
            },
        }),

        prisma.pEI.create({
            data: {
                studentId: students[1].id,
                version: 1,
                content:
                    "PEI focado no desenvolvimento social e comunicativo da aluna Sofia Rodrigues, com estratégias específicas para TEA.",
                formQuestions: {
                    objetivos: [
                        "Melhorar comunicação",
                        "Desenvolver habilidades sociais",
                    ],
                    metodologias: [
                        "Terapia ocupacional",
                        "Acompanhamento psicológico",
                    ],
                    recursos: [
                        "Comunicação alternativa",
                        "Ambiente estruturado",
                    ],
                },
                startDate: new Date("2024-02-01"),
                endDate: new Date("2024-12-01"),
                status: "ACTIVE",
                createdById: teachers[0].profile.id,
                isRenewal: false,
            },
        }),

        prisma.pEI.create({
            data: {
                studentId: students[2].id,
                version: 1,
                content:
                    "PEI para Gabriel Almeida com estratégias para melhorar a atenção e concentração durante as atividades escolares.",
                formQuestions: {
                    objetivos: ["Melhorar atenção", "Desenvolver organização"],
                    metodologias: [
                        "Pausas programadas",
                        "Ambiente sem distrações",
                    ],
                    recursos: ["Timer visual", "Agenda estruturada"],
                },
                startDate: new Date("2024-01-20"),
                endDate: new Date("2024-12-20"),
                status: "ACTIVE",
                createdById: teachers[1].profile.id,
                isRenewal: false,
            },
        }),
    ]);

    console.log(`✅ ${peis.length} PEIs criados`);
    return peis;
}

async function createNotes(students: any[], users: any[]) {
    console.log("📝 Criando notas...");

    const teachers = users.filter((u) => u.profile.role === "TEACHER");

    const notes = await Promise.all([
        prisma.note.create({
            data: {
                studentId: students[0].id,
                content:
                    "Lucas demonstrou melhora significativa na resolução de problemas matemáticos simples. Participou ativamente das atividades em grupo.",
                createdById: teachers[0].profile.id,
            },
        }),

        prisma.note.create({
            data: {
                studentId: students[1].id,
                content:
                    "Sofia iniciou comunicação verbal com colegas. Demonstrou interesse em atividades artísticas. Necessita de mais estímulo para interação social.",
                createdById: teachers[0].profile.id,
            },
        }),

        prisma.note.create({
            data: {
                studentId: students[2].id,
                content:
                    "Gabriel apresentou dificuldade para manter foco durante a aula de português. Beneficiou-se das pausas programadas.",
                createdById: teachers[1].profile.id,
            },
        }),

        prisma.note.create({
            data: {
                studentId: students[3].id,
                content:
                    "Isabella demonstrou progresso nas atividades de coordenação motora fina. Participou da aula de artes com entusiasmo.",
                createdById: teachers[2].profile.id,
            },
        }),

        prisma.note.create({
            data: {
                studentId: students[4].id,
                content:
                    "Matheus apresentou dificuldades na leitura de textos simples. Necessita de mais prática com sílabas complexas.",
                createdById: teachers[2].profile.id,
            },
        }),
    ]);

    console.log(`✅ ${notes.length} notas criadas`);
    return notes;
}

async function createWeeklyPlans(students: any[], users: any[]) {
    console.log("📅 Criando planos semanais...");

    const teachers = users.filter((u) => u.profile.role === "TEACHER");

    const weeklyPlans = await Promise.all([
        prisma.weeklyPlan.create({
            data: {
                studentId: students[0].id,
                weekStart: new Date("2024-03-11"),
                weekEnd: new Date("2024-03-17"),
                content:
                    "Plano semanal focado em atividades matemáticas práticas e jogos educativos para Lucas.",
                weekActivities: {
                    segunda: [
                        "Matemática: Adição com material concreto",
                        "Educação Física",
                    ],
                    terça: ["Português: Leitura compartilhada", "Arte"],
                    quarta: ["Matemática: Subtração simples", "Música"],
                    quinta: [
                        "Ciências: Observação da natureza",
                        "Educação Física",
                    ],
                    sexta: ["Matemática: Jogos matemáticos", "História"],
                },
                formQuestions: {
                    objetivos: [
                        "Praticar adição e subtração",
                        "Desenvolver coordenação motora",
                    ],
                    recursos: ["Material concreto", "Jogos educativos"],
                    avaliacao: "Observação contínua",
                },
                createdById: teachers[0].profile.id,
            },
        }),

        prisma.weeklyPlan.create({
            data: {
                studentId: students[1].id,
                weekStart: new Date("2024-03-11"),
                weekEnd: new Date("2024-03-17"),
                content:
                    "Plano semanal com foco em atividades sociais e comunicativas para Sofia.",
                weekActivities: {
                    segunda: [
                        "Comunicação: Diálogo em grupo",
                        "Arte: Pintura coletiva",
                    ],
                    terça: ["Educação Física: Jogos cooperativos", "Música"],
                    quarta: ["Português: Histórias com imagens", "Ciências"],
                    quinta: ["Arte: Trabalho manual", "Educação Física"],
                    sexta: ["História: Contação de histórias", "Matemática"],
                },
                formQuestions: {
                    objetivos: [
                        "Estimular comunicação",
                        "Desenvolver interação social",
                    ],
                    recursos: ["Imagens e figuras", "Material artístico"],
                    avaliacao: "Registro de interações",
                },
                createdById: teachers[0].profile.id,
            },
        }),
    ]);

    console.log(`✅ ${weeklyPlans.length} planos semanais criados`);
    return weeklyPlans;
}

async function createSubscriptions(users: any[]) {
    console.log("💳 Criando assinaturas...");

    const director = users.find((u) => u.profile.role === "DIRECTOR");
    const teachers = users.filter((u) => u.profile.role === "TEACHER");

    if (!director) {
        throw new Error("Diretor não encontrado");
    }

    // Criar uma única assinatura compartilhada entre diretor e professores
    const sharedSubscription = await prisma.subscription.create({
        data: {
            planType: "PREMIUM",
            status: "ACTIVE",
            startDate: new Date("2024-01-01"),
            endDate: new Date("2024-12-31"),
            externalId: "sub_shared_001",
            limits: {
                create: {
                    maxStudents: 100,
                    maxPeiPerTrimester: 50,
                    maxWeeklyPlans: 200,
                },
            },
            features: {
                create: {
                    premiumSupport: true,
                },
            },
        },
    });

    // Atualizar perfil do diretor com a assinatura compartilhada
    await prisma.profile.update({
        where: { id: director.profile.id },
        data: { subscriptionId: sharedSubscription.id },
    });

    // Atualizar perfis dos professores com a mesma assinatura compartilhada
    await Promise.all(
        teachers.map((teacher) =>
            prisma.profile.update({
                where: { id: teacher.profile.id },
                data: { subscriptionId: sharedSubscription.id },
            }),
        ),
    );

    console.log(
        "✅ Assinatura compartilhada criada para diretor e professores",
    );
}

// main()
//     .catch((e) => {
//         console.error("❌ Erro durante o seed:", e);
//         process.exit(1);
//     })
//     .finally(async () => {
//         await prisma.$disconnect();
//     });
