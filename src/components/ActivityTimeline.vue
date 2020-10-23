<template>
  <div id="timeline">
    <div class="date-group" v-for="dateKey of dates" :key="dateKey">
      <h3 class="date-section">{{ getShortDateString(groups[dateKey].date) }}</h3>
      <JournalEntry v-for="activity of groups[dateKey].activities"
                    :actv="activity"
                    :key="activity.id">
      </JournalEntry>
    </div>
  </div>
</template>

<script>
  import JournalEntry from './JournalEntry.vue';

  export default {
    name: 'ActivityTimeline',
    components: {JournalEntry},
    props: {
      activities: Array
    },
    data() {
      return {
        groups: {}
      }
    },
    computed: {
      dates() {
        return Object.keys(this.groups).sort(this.chronoSort);
      }
    },
    methods: {
      chronoSort(a, b) {  //  sort an array of dates in reverse chronological order
        return b - a;
      },
      getShortDateString(d) {
        return `${d.getMonth() + 1}/${d.getDate()}`;
      },
      dateKeyFrom(d) {
        return d.toISOString().slice(0, 10);
      },
      getDateGroups(activities) {
        const groups = {};
        activities.forEach(actv => {
          const key = this.dateKeyFrom(actv.time);
          if(!groups[key]) {
            const date = new Date(actv.time.getFullYear(), actv.time.getMonth(), actv.time.getDate());
            groups[key] = {
              date,
              activities: [actv]
            };
          }
          else {
            //  in theory this should keep activities sorted by time
            let ind;
            for(ind = 0; ind < groups[key].activities.length; ind++) {
              if(groups[key].activities[ind].time > actv.time) {
                break;
              }
            }
            groups[key].activities.splice(ind, 0, actv);
          }
        });
        return groups;
      },
      getActivitiesOn(date) {
        let key = date;
        if(date instanceof Date) {
          key = this.dateKeyFrom(date);
        }
        return this.groups[key].activities.slice();
      }
    },
    beforeMount() {
      console.debug(this.activities);
      this.groups = this.getDateGroups(this.activities);
      console.debug(this.groups);
    }
  }
</script>

<style scoped>
</style>
