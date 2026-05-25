/**
 * db.js - Core State Management & Data Persistence for GymFlow CRM
 * Uses localStorage to store the gym's database.
 */

const STORAGE_KEY = 'gymflow_crm_state';

// Query parameter check to clear localStorage (handy for debugging & resets)
if (typeof window !== 'undefined' && window.location.search.includes('clear=true')) {
  localStorage.removeItem(STORAGE_KEY);
  console.log("GymFlow CRM State reset requested via URL query parameter.");
}

// Helper to get formatted date string (YYYY-MM-DD)
export function formatDate(dateObj) {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Generate dynamic dates relative to today
const today = new Date();
const daysAgo = (n) => new Date(today.getTime() - n * 24 * 60 * 60 * 1000);
const daysHence = (n) => new Date(today.getTime() + n * 24 * 60 * 60 * 1000);

const defaultState = {
  trainers: [
    { id: "t1", name: "Alex Rivera", specialty: "Strength & Conditioning", email: "alex@gymflow.com", phone: "555-0192", avatar: "🏋️‍♂️" },
    { id: "t2", name: "Sarah Chen", specialty: "Yoga & Flexibility", email: "sarah@gymflow.com", phone: "555-0143", avatar: "🧘‍♀️" },
    { id: "t3", name: "Marcus Johnson", specialty: "Cardio & HIIT", email: "marcus@gymflow.com", phone: "555-0188", avatar: "🏃‍♂️" }
  ],
  plans: [
    { id: "w1", type: "workout", name: "Hypertrophy Push/Pull/Legs", description: "Standard 3-day split for muscle hypertrophy.", details: "Push: Bench Press (4x8), Shoulder Press (3x10), Tricep Pushdowns (3x12)\nPull: Pullups (4xMax), Barbell Row (3x8), Bicep Curls (3x12)\nLegs: Squats (4x8), Leg Press (3x10), Calf Raises (4x15)" },
    { id: "w2", type: "workout", name: "Beginner Cardio & Core", description: "Low-impact endurance and core stabilization.", details: "Warmup: 5 mins treadmill walking\nIntervals: 20 mins HIIT on stationary bike (30s fast, 30s slow)\nCore: Plank (3x60s), Russian Twists (3x20), Hanging Leg Raises (3x10)" },
    { id: "d1", type: "diet", name: "High Protein Lean Bulk", description: "Nutrient-dense meal plan aiming at muscle gain.", details: "Meal 1: 4 scrambled eggs, 2 slices whole-wheat toast, 1 banana\nMeal 2 (Post-Workout): Whey protein shake, 50g oats, 1 tbsp peanut butter\nMeal 3: 200g grilled chicken breast, 150g jasmine rice, broccoli\nMeal 4: 150g canned tuna, mixed greens, olive oil dressing\nMeal 5: 200g Greek yogurt, mixed berries, almonds" },
    { id: "d2", type: "diet", name: "Keto Shred / Fat Loss", description: "Low carb, high fat diet plan for rapid fat loss.", details: "Meal 1: 3 bacon strips, 2 eggs fried in butter, avocado\nMeal 2: Spinach salad with grilled salmon, walnuts, olive oil\nMeal 3: Beef ribeye steak, roasted asparagus, butter sauce\nMeal 4: Handful of macadamia nuts, celery sticks with cream cheese\nMeal 5: Casein shake (unsweetened almond milk), coconut oil" }
  ],
  members: [
    {
      id: "m1",
      name: "John Doe",
      email: "john.doe@gmail.com",
      phone: "555-1234",
      membershipTier: "Standard",
      membershipStatus: "Active",
      joinedDate: formatDate(daysAgo(120)),
      renewalDate: formatDate(daysHence(15)),
      assignedTrainerId: "t1",
      workoutPlanId: "w1",
      dietPlanId: "d1",
      payments: [
        { date: formatDate(daysAgo(15)), amount: 50, status: "Paid" },
        { date: formatDate(daysAgo(45)), amount: 50, status: "Paid" }
      ],
      attendance: [formatDate(today), formatDate(daysAgo(1)), formatDate(daysAgo(3)), formatDate(daysAgo(4)), formatDate(daysAgo(5))]
    },
    // Duplicate John Doe (VIP) to compare performance
    {
      id: "m9",
      name: "John Doe",
      email: "j.doe.vip@gmail.com",
      phone: "555-4321",
      membershipTier: "VIP",
      membershipStatus: "Active",
      joinedDate: formatDate(daysAgo(80)),
      renewalDate: formatDate(daysHence(25)),
      assignedTrainerId: "t2",
      workoutPlanId: "w1",
      dietPlanId: "d1",
      payments: [
        { date: formatDate(daysAgo(5)), amount: 100, status: "Paid" },
        { date: formatDate(daysAgo(35)), amount: 100, status: "Paid" }
      ],
      attendance: [formatDate(today), formatDate(daysAgo(1)), formatDate(daysAgo(2)), formatDate(daysAgo(3)), formatDate(daysAgo(4)), formatDate(daysAgo(5)), formatDate(daysAgo(6)), formatDate(daysAgo(7))]
    },
    {
      id: "m2",
      name: "Jane Smith",
      email: "jane.smith@yahoo.com",
      phone: "555-5678",
      membershipTier: "VIP",
      membershipStatus: "Active",
      joinedDate: formatDate(daysAgo(200)),
      renewalDate: formatDate(daysHence(12)),
      assignedTrainerId: "t2",
      workoutPlanId: "w2",
      dietPlanId: "d2",
      payments: [
        { date: formatDate(daysAgo(18)), amount: 100, status: "Paid" },
        { date: formatDate(daysAgo(48)), amount: 100, status: "Paid" }
      ],
      attendance: [formatDate(today), formatDate(daysAgo(2)), formatDate(daysAgo(5)), formatDate(daysAgo(8))]
    },
    // Duplicate Jane Smith (Basic) to compare performance
    {
      id: "m10",
      name: "Jane Smith",
      email: "jane.smith.basic@outlook.com",
      phone: "555-8765",
      membershipTier: "Basic",
      membershipStatus: "Overdue",
      joinedDate: formatDate(daysAgo(45)),
      renewalDate: formatDate(daysAgo(5)),
      assignedTrainerId: "t3",
      workoutPlanId: null,
      dietPlanId: null,
      payments: [
        { date: formatDate(daysAgo(45)), amount: 30, status: "Paid" }
      ],
      attendance: [formatDate(daysAgo(15)), formatDate(daysAgo(20))]
    },
    {
      id: "m3",
      name: "Robert Downey",
      email: "robert@rdj.me",
      phone: "555-9012",
      membershipTier: "Basic",
      membershipStatus: "Overdue",
      joinedDate: formatDate(daysAgo(90)),
      renewalDate: formatDate(daysAgo(3)),
      assignedTrainerId: null,
      workoutPlanId: null,
      dietPlanId: null,
      payments: [
        { date: formatDate(daysAgo(33)), amount: 30, status: "Paid" },
        { date: formatDate(daysAgo(63)), amount: 30, status: "Paid" }
      ],
      attendance: [formatDate(daysAgo(4)), formatDate(daysAgo(8)), formatDate(daysAgo(11))]
    },
    {
      id: "m4",
      name: "Emily Watson",
      email: "emily.watson@gmail.com",
      phone: "555-3456",
      membershipTier: "Standard",
      membershipStatus: "Active",
      joinedDate: formatDate(daysAgo(60)),
      renewalDate: formatDate(daysHence(4)),
      assignedTrainerId: "t3",
      workoutPlanId: "w1",
      dietPlanId: "d1",
      payments: [
        { date: formatDate(daysAgo(26)), amount: 50, status: "Paid" },
        { date: formatDate(daysAgo(56)), amount: 50, status: "Paid" }
      ],
      attendance: [formatDate(daysAgo(1)), formatDate(daysAgo(3)), formatDate(daysAgo(6)), formatDate(daysAgo(8))]
    },
    {
      id: "m5",
      name: "David Beckham",
      email: "david@beckham.co.uk",
      phone: "555-7890",
      membershipTier: "VIP",
      membershipStatus: "Active",
      joinedDate: formatDate(daysAgo(18)),
      renewalDate: formatDate(daysHence(12)),
      assignedTrainerId: "t1",
      workoutPlanId: "w1",
      dietPlanId: null,
      payments: [
        { date: formatDate(daysAgo(18)), amount: 100, status: "Paid" }
      ],
      attendance: [formatDate(today), formatDate(daysAgo(2)), formatDate(daysAgo(3)), formatDate(daysAgo(5)), formatDate(daysAgo(8)), formatDate(daysAgo(9))]
    },
    {
      id: "m6",
      name: "Clara Oswald",
      email: "clara.o@outlook.com",
      phone: "555-2345",
      membershipTier: "Basic",
      membershipStatus: "Active",
      joinedDate: formatDate(daysAgo(25)),
      renewalDate: formatDate(daysHence(5)),
      assignedTrainerId: null,
      workoutPlanId: null,
      dietPlanId: null,
      payments: [
        { date: formatDate(daysAgo(25)), amount: 30, status: "Paid" }
      ],
      attendance: [formatDate(daysAgo(5)), formatDate(daysAgo(8)), formatDate(daysAgo(13))]
    },
    {
      id: "m7",
      name: "Michael Jordan",
      email: "mj23@bulls.com",
      phone: "555-2323",
      membershipTier: "VIP",
      membershipStatus: "Overdue",
      joinedDate: formatDate(daysAgo(120)),
      renewalDate: formatDate(daysAgo(10)),
      assignedTrainerId: "t3",
      workoutPlanId: "w1",
      dietPlanId: "d1",
      payments: [
        { date: formatDate(daysAgo(40)), amount: 100, status: "Paid" },
        { date: formatDate(daysAgo(70)), amount: 100, status: "Paid" }
      ],
      attendance: [formatDate(daysAgo(11)), formatDate(daysAgo(12)), formatDate(daysAgo(14))]
    },
    {
      id: "m8",
      name: "Taylor Swift",
      email: "taylor@swift.com",
      phone: "555-1989",
      membershipTier: "Standard",
      membershipStatus: "Inactive",
      joinedDate: formatDate(daysAgo(300)),
      renewalDate: formatDate(daysAgo(120)),
      assignedTrainerId: null,
      workoutPlanId: null,
      dietPlanId: null,
      payments: [
        { date: formatDate(daysAgo(150)), amount: 50, status: "Paid" }
      ],
      attendance: []
    }
  ]
};

// Initialize state immediately to avoid Temporal Dead Zone (TDZ) reference errors
let state = defaultState;

function loadState() {
  if (typeof localStorage === 'undefined') {
    return defaultState;
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Validate schema format is correct
      if (parsed && Array.isArray(parsed.members) && Array.isArray(parsed.trainers) && Array.isArray(parsed.plans)) {
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse stored CRM state, using default.", e);
    }
  }
  return defaultState;
}

function saveState(newState) {
  state = newState;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }
}

// Load state safely
state = loadState();

// Save default state to localStorage if it wasn't already stored
if (typeof localStorage !== 'undefined' && !localStorage.getItem(STORAGE_KEY)) {
  saveState(state);
}

// DATABASE API
export const db = {
  getState: () => state,

  // MEMBERS
  getMembers: () => state.members || [],
  getMemberById: (id) => (state.members || []).find(m => m.id === id),
  addMember: (memberData) => {
    const newMember = {
      id: 'm_' + Date.now(),
      name: memberData.name,
      email: memberData.email,
      phone: memberData.phone,
      membershipTier: memberData.membershipTier,
      membershipStatus: memberData.membershipStatus || 'Active',
      joinedDate: memberData.joinedDate || formatDate(new Date()),
      renewalDate: memberData.renewalDate,
      assignedTrainerId: memberData.assignedTrainerId || null,
      workoutPlanId: memberData.workoutPlanId || null,
      dietPlanId: memberData.dietPlanId || null,
      payments: memberData.payments || [],
      attendance: memberData.attendance || []
    };
    
    // Auto-create initial payment if status is Active
    if (newMember.membershipStatus === 'Active' && newMember.payments.length === 0) {
      const amounts = { Basic: 30, Standard: 50, VIP: 100 };
      newMember.payments.push({
        date: formatDate(new Date()),
        amount: amounts[newMember.membershipTier] || 50,
        status: "Paid"
      });
    }

    const updated = [...(state.members || []), newMember];
    saveState({ ...state, members: updated });
    return newMember;
  },
  updateMember: (id, updatedData) => {
    const updated = (state.members || []).map(m => {
      if (m.id === id) {
        return { ...m, ...updatedData };
      }
      return m;
    });
    saveState({ ...state, members: updated });
  },
  deleteMember: (id) => {
    const updated = (state.members || []).filter(m => m.id !== id);
    saveState({ ...state, members: updated });
  },

  // RENEWALS & PAYMENTS
  renewMembership: (id) => {
    const member = (state.members || []).find(m => m.id === id);
    if (!member) return;
    
    const amounts = { Basic: 30, Standard: 50, VIP: 100 };
    const fee = amounts[member.membershipTier] || 50;
    
    const currentRenewal = new Date(member.renewalDate);
    const baseDate = currentRenewal > today ? currentRenewal : new Date();
    const newRenewalDate = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    const payment = {
      date: formatDate(new Date()),
      amount: fee,
      status: "Paid"
    };

    const updatedMembers = (state.members || []).map(m => {
      if (m.id === id) {
        return {
          ...m,
          membershipStatus: "Active",
          renewalDate: formatDate(newRenewalDate),
          payments: [payment, ...(m.payments || [])]
        };
      }
      return m;
    });

    saveState({ ...state, members: updatedMembers });
    return { nextRenewal: formatDate(newRenewalDate), amount: fee };
  },

  // ATTENDANCE
  checkInMember: (id) => {
    const member = (state.members || []).find(m => m.id === id);
    if (!member) return { success: false, message: "Member not found" };

    const todayStr = formatDate(new Date());
    const attendanceList = member.attendance || [];
    if (attendanceList.includes(todayStr)) {
      return { success: false, message: `${member.name} is already checked in today!` };
    }

    const updatedMembers = (state.members || []).map(m => {
      if (m.id === id) {
        return {
          ...m,
          attendance: [todayStr, ...(m.attendance || [])]
        };
      }
      return m;
    });

    saveState({ ...state, members: updatedMembers });
    return { success: true, message: `Successfully checked in ${member.name}!`, member };
  },

  // TRAINERS
  getTrainers: () => state.trainers || [],
  getTrainerById: (id) => (state.trainers || []).find(t => t.id === id),
  assignTrainer: (memberId, trainerId) => {
    const updatedMembers = (state.members || []).map(m => {
      if (m.id === memberId) {
        return { ...m, assignedTrainerId: trainerId || null };
      }
      return m;
    });
    saveState({ ...state, members: updatedMembers });
  },

  // PLANS
  getPlans: () => state.plans || [],
  getPlanById: (id) => (state.plans || []).find(p => p.id === id),
  assignPlanToMember: (memberId, planId, planType) => {
    const updatedMembers = (state.members || []).map(m => {
      if (m.id === memberId) {
        if (planType === 'workout') {
          return { ...m, workoutPlanId: planId || null };
        } else if (planType === 'diet') {
          return { ...m, dietPlanId: planId || null };
        }
      }
      return m;
    });
    saveState({ ...state, members: updatedMembers });
  },
  createPlan: (planData) => {
    const newPlan = {
      id: 'p_' + Date.now(),
      type: planData.type,
      name: planData.name,
      description: planData.description,
      details: planData.details
    };
    const updated = [...(state.plans || []), newPlan];
    saveState({ ...state, plans: updated });
    return newPlan;
  },

  // ANALYTICS & STATS HELPERS
  getDashboardStats: () => {
    const members = state.members || [];
    const active = members.filter(m => m.membershipStatus === 'Active');
    const overdue = members.filter(m => m.membershipStatus === 'Overdue');
    const todayStr = formatDate(new Date());
    const checkedInToday = members.filter(m => (m.attendance || []).includes(todayStr));

    const upcomingLimit = daysHence(7);
    const upcomingRenewals = members.filter(m => {
      if (m.membershipStatus !== 'Active') return false;
      const rDate = new Date(m.renewalDate);
      return rDate >= today && rDate <= upcomingLimit;
    });

    const thirtyDaysAgo = daysAgo(30);
    let last30DaysRevenue = 0;
    members.forEach(m => {
      (m.payments || []).forEach(p => {
        const pDate = new Date(p.date);
        if (pDate >= thirtyDaysAgo && p.status === 'Paid') {
          last30DaysRevenue += p.amount;
        }
      });
    });

    return {
      totalMembers: members.length,
      activeMembers: active.length,
      overdueMembers: overdue.length,
      upcomingRenewals: upcomingRenewals.length,
      checkedInToday: checkedInToday.length,
      monthlyRevenue: last30DaysRevenue
    };
  },

  // Weekly attendance array for the graph (last 7 days)
  getWeeklyAttendanceData: () => {
    const labels = [];
    const counts = [];
    for (let i = 6; i >= 0; i--) {
      const day = daysAgo(i);
      const dayStr = formatDate(day);
      const label = day.toLocaleDateString('en-US', { weekday: 'short' });
      labels.push(label);

      const count = (state.members || []).filter(m => (m.attendance || []).includes(dayStr)).length;
      counts.push(count);
    }
    return { labels, counts };
  }
};
