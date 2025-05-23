class TaskService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'task4';
    // All fields for task4 table
    this.allFields = ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'title', 'description', 'priority', 'status', 'dueDate', 'parentTaskId', 'workspaceId', 'ownerId'];
    // Only updateable fields for create/update operations
    this.updateableFields = ['Name', 'Tags', 'Owner', 'title', 'description', 'priority', 'status', 'dueDate', 'parentTaskId', 'workspaceId', 'ownerId'];
  }

  async fetchTasks(filters = {}) {
    try {
      const params = {
        fields: this.allFields,
        orderBy: [
          {
            fieldName: "CreatedOn",
            SortType: "DESC"
          }
        ]
      };

      // Add filters if provided
      if (filters.where && filters.where.length > 0) {
        params.where = filters.where;
      }

      if (filters.limit) {
        params.pagingInfo = {
          limit: filters.limit,
          offset: filters.offset || 0
        };
      }

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response || !response.data || response.data.length === 0) {
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  }

  async getTaskById(taskId) {
    try {
      const params = {
        fields: this.allFields
      };

      const response = await this.apperClient.getRecordById(this.tableName, taskId, params);
      
      if (!response || !response.data) {
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching task with ID ${taskId}:`, error);
      throw error;
    }
  }

  async createTasks(tasks) {
    try {
      // Filter data to only include updateable fields
      const filteredTasks = tasks.map(task => {
        const filteredTask = {};
        this.updateableFields.forEach(field => {
          if (task[field] !== undefined) {
            // Handle data type formatting
            if (field === 'dueDate' && task[field]) {
              // Ensure date is in YYYY-MM-DD format
              const date = new Date(task[field]);
              filteredTask[field] = date.toISOString().split('T')[0];
            } else if (field === 'Tags' && Array.isArray(task[field])) {
              filteredTask[field] = task[field].join(',');
            } else {
              filteredTask[field] = task[field];
            }
          }
        });
        return filteredTask;
      });

      const params = {
        records: filteredTasks
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (response && response.success && response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        console.log(`Created ${successfulRecords.length} tasks successfully`);
        if (failedRecords.length > 0) {
          console.warn(`Failed to create ${failedRecords.length} tasks`);
          failedRecords.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => {
                console.error(`Field: ${error.fieldLabel}, Error: ${error.message}`);
              });
            } else if (record.message) {
              console.error(`Error: ${record.message}`);
            }
          });
        }
        
        return successfulRecords.map(result => result.data);
      } else {
        console.error("Bulk task creation failed:", response);
        return [];
      }
    } catch (error) {
      console.error("Error creating tasks:", error);
      throw error;
    }
  }

  async updateTasks(tasks) {
    try {
      // Filter data to only include updateable fields (plus Id)
      const filteredTasks = tasks.map(task => {
        const filteredTask = { Id: task.Id };
        this.updateableFields.forEach(field => {
          if (task[field] !== undefined) {
            // Handle data type formatting
            if (field === 'dueDate' && task[field]) {
              // Ensure date is in YYYY-MM-DD format
              const date = new Date(task[field]);
              filteredTask[field] = date.toISOString().split('T')[0];
            } else if (field === 'Tags' && Array.isArray(task[field])) {
              filteredTask[field] = task[field].join(',');
            } else {
              filteredTask[field] = task[field];
            }
          }
        });
        return filteredTask;
      });

      const params = {
        records: filteredTasks
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (response && response.success && response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        console.log(`Updated ${successfulUpdates.length} tasks successfully`);
        if (failedUpdates.length > 0) {
          console.warn(`Failed to update ${failedUpdates.length} tasks`);
          failedUpdates.forEach(record => {
            console.error(`Error: ${record.message || "Record does not exist"}`);
          });
        }
        
        return successfulUpdates.map(result => result.data);
      } else {
        console.error("Bulk task update failed:", response);
        return [];
      }
    } catch (error) {
      console.error("Error updating tasks:", error);
      throw error;
    }
  }

  async deleteTasks(taskIds) {
    try {
      const params = {
        RecordIds: taskIds
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (response && response.success && response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        console.log(`Deleted ${successfulDeletions.length} tasks successfully`);
        if (failedDeletions.length > 0) {
          console.warn(`Failed to delete ${failedDeletions.length} tasks`);
          failedDeletions.forEach(record => {
            console.error(`Error: ${record.message || "Record does not exist"}`);
          });
        }
        
        return true;
      } else {
        console.error("Bulk task deletion failed:", response);
        return false;
      }
    } catch (error) {
      console.error("Error deleting tasks:", error);
      throw error;
    }
  }

  async searchTasks(query) {
    try {
      const filters = {
        where: [
          {
            fieldName: "title",
            operator: "Contains",
            values: [query]
          }
        ]
      };
      return await this.fetchTasks(filters);
    } catch (error) {
      console.error("Error searching tasks:", error);
      throw error;
    }
  }
}

export default new TaskService();